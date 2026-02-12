-- ============================================================================
-- MIGRATE ALL PRODUCTS TO STRIPE CHECKOUT FLOW
-- ============================================================================
-- This script safely updates all products to use 'stripe' as checkout_flow
-- Date: 2026-02-12
-- Total Products: ~500
-- ============================================================================

-- ============================================================================
-- STEP 1: BACKUP - View current checkout flow distribution
-- ============================================================================
-- Run this first to see what you currently have
SELECT 
    checkout_flow,
    COUNT(*) as product_count
FROM products
GROUP BY checkout_flow
ORDER BY product_count DESC;

-- Optional: Export current state for backup
-- SELECT * FROM products; -- Copy results to backup file


-- ============================================================================
-- STEP 2: PREVIEW - See what will be changed
-- ============================================================================
-- This shows which products will be updated (doesn't change anything)
SELECT 
    id,
    slug,
    title,
    checkout_flow as current_checkout_flow,
    'stripe' as new_checkout_flow
FROM products
WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL
ORDER BY created_at DESC
LIMIT 20; -- Preview first 20


-- ============================================================================
-- STEP 3: COUNT - Verify how many products will be updated
-- ============================================================================
SELECT 
    COUNT(*) as products_to_update
FROM products
WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL;


-- ============================================================================
-- STEP 4: UPDATE - Actually change the checkout flow to 'stripe'
-- ============================================================================
-- ⚠️ IMPORTANT: Only run this after reviewing steps 1-3!
-- This is the actual update query

UPDATE products
SET 
    checkout_flow = 'stripe',
    updated_at = NOW() -- Update timestamp to track when changed
WHERE 
    checkout_flow != 'stripe' OR checkout_flow IS NULL;

-- Expected result: UPDATE 500 (or however many products match)


-- ============================================================================
-- STEP 5: VERIFY - Confirm all products are now using 'stripe'
-- ============================================================================
-- Run this to verify the update worked
SELECT 
    checkout_flow,
    COUNT(*) as product_count
FROM products
GROUP BY checkout_flow
ORDER BY product_count DESC;

-- Check if any products are still not 'stripe'
SELECT 
    id,
    slug,
    title,
    checkout_flow
FROM products
WHERE checkout_flow != 'stripe'
LIMIT 10;


-- ============================================================================
-- STEP 6: SAMPLE CHECK - View some updated products
-- ============================================================================
-- Spot-check a few products to ensure data integrity
SELECT 
    id,
    slug,
    title,
    checkout_flow,
    price,
    currency,
    published,
    updated_at
FROM products
ORDER BY updated_at DESC
LIMIT 10;


-- ============================================================================
-- ROLLBACK (EMERGENCY ONLY)
-- ============================================================================
-- If something goes wrong, you can rollback to specific checkout flows
-- Example: Restore specific products to 'buymeacoffee'

-- Uncomment and modify if needed:
-- UPDATE products
-- SET checkout_flow = 'buymeacoffee'
-- WHERE id IN (
--     'product-id-1',
--     'product-id-2'
--     -- Add specific product IDs here
-- );


-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This update is SAFE - it only changes the checkout_flow field
-- 2. No products are deleted
-- 3. No prices, titles, or other data is modified
-- 4. The updated_at timestamp is updated for tracking
-- 5. You can always change individual products back via admin panel
--
-- Valid checkout_flow values:
-- - 'stripe'       (Stripe payment processing)
-- - 'buymeacoffee' (Buy Me a Coffee)
-- - 'kofi'         (Ko-fi)
-- - 'external'     (External checkout link)
-- ============================================================================
