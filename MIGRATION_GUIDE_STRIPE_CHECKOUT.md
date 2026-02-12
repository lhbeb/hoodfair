# 🚀 Quick Migration Guide: Update All Products to Stripe Checkout

**Date:** February 12, 2026  
**Products:** ~500  
**Action:** Change all checkout flows to 'stripe'  

---

## 🎯 Three Ways to Execute

### **Option 1: Supabase Dashboard (SAFEST - RECOMMENDED)**

1. **Go to:** https://supabase.com/dashboard
2. **Open your project**
3. **Click:** SQL Editor (left sidebar)
4. **Copy/paste the queries from `migrate_to_stripe_checkout.sql`**
5. **Run each step in order** (1 → 6)

**Pros:**
- ✅ Visual confirmation at each step
- ✅ Easy to stop if something looks wrong
- ✅ Can review results before proceeding

---

### **Option 2: One-Line Quick Update (FAST)**

If you trust the migration and want it done in one shot:

```sql
UPDATE products SET checkout_flow = 'stripe', updated_at = NOW() WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL;
```

**Pros:**
- ✅ Fast (single query)
- ✅ Simple

**Cons:**
- ⚠️ No preview
- ⚠️ Can't see what changed

---

### **Option 3: Terminal with Supabase CLI**

If you have Supabase credentials:

```bash
# Set your Supabase details
export SUPABASE_URL="your-project.supabase.co"
export SUPABASE_KEY="your-service-role-key"

# Execute the migration
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" << EOF
-- Preview first
SELECT checkout_flow, COUNT(*) FROM products GROUP BY checkout_flow;

-- Update
UPDATE products 
SET checkout_flow = 'stripe', updated_at = NOW() 
WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL;

-- Verify
SELECT checkout_flow, COUNT(*) FROM products GROUP BY checkout_flow;
EOF
```

---

## 📋 Step-by-Step Instructions (Recommended)

### **Step 1: Check Current State**

```sql
SELECT 
    checkout_flow,
    COUNT(*) as product_count
FROM products
GROUP BY checkout_flow
ORDER BY product_count DESC;
```

**Expected Output:**
```
checkout_flow    | product_count
-----------------+--------------
buymeacoffee     | 300
kofi             | 150
external         | 50
NULL             | 0
```

---

### **Step 2: Preview Changes**

```sql
SELECT 
    id,
    slug,
    title,
    checkout_flow as current,
    'stripe' as will_become
FROM products
WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL
LIMIT 10;
```

**This shows you what will change WITHOUT making changes**

---

### **Step 3: Count Products to Update**

```sql
SELECT COUNT(*) as will_be_updated
FROM products
WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL;
```

**Expected:** `500` (or close to it)

---

### **Step 4: Execute Migration**

```sql
UPDATE products
SET 
    checkout_flow = 'stripe',
    updated_at = NOW()
WHERE 
    checkout_flow != 'stripe' OR checkout_flow IS NULL;
```

**Expected Result:**
```
UPDATE 500
```

---

### **Step 5: Verify Success**

```sql
SELECT 
    checkout_flow,
    COUNT(*) as product_count
FROM products
GROUP BY checkout_flow;
```

**Expected Output:**
```
checkout_flow | product_count
--------------+--------------
stripe        | 500
```

---

### **Step 6: Spot Check**

```sql
SELECT 
    slug,
    title,
    checkout_flow,
    price,
    published
FROM products
ORDER BY updated_at DESC
LIMIT 5;
```

**Verify:**
- ✅ checkout_flow = 'stripe'
- ✅ Price still correct
- ✅ Title still correct
- ✅ No data lost

---

## 🛡️ Safety Features

### **This Migration is SAFE because:**

1. ✅ **Only updates `checkout_flow` field** - nothing else
2. ✅ **No products deleted** - UPDATE, not DELETE
3. ✅ **No prices changed** - only checkout method
4. ✅ **Timestamps updated** - can track when changed
5. ✅ **Reversible** - can change back if needed

### **What's NOT changed:**

- ❌ Product titles
- ❌ Product prices
- ❌ Product images
- ❌ Product descriptions
- ❌ Product slugs
- ❌ Published status
- ❌ Product IDs

**Only the checkout_flow field changes from `buymeacoffee`/`kofi`/`external` to `stripe`**

---

## 🔄 Rollback (If Needed)

If you need to undo the migration:

### **Rollback All to Buy Me a Coffee:**
```sql
UPDATE products
SET checkout_flow = 'buymeacoffee'
WHERE checkout_flow = 'stripe';
```

### **Rollback Specific Product:**
```sql
UPDATE products
SET checkout_flow = 'buymeacoffee'
WHERE slug = 'specific-product-slug';
```

### **Rollback by Date (if you need to restore):**
```sql
-- Restore products updated after a specific time
UPDATE products
SET checkout_flow = 'buymeacoffee'
WHERE updated_at > '2026-02-12 04:00:00'
  AND checkout_flow = 'stripe';
```

---

## 📊 Expected Before/After

### **BEFORE Migration:**
```
Products: 500
├── buymeacoffee: 300 products (60%)
├── kofi: 150 products (30%)
├── external: 50 products (10%)
└── stripe: 0 products (0%)
```

### **AFTER Migration:**
```
Products: 500
├── buymeacoffee: 0 products (0%)
├── kofi: 0 products (0%)
├── external: 0 products (0%)
└── stripe: 500 products (100%) ✅
```

---

## ⚡ Quick Execution Steps

**For those who trust the process:**

1. Open Supabase SQL Editor
2. Run this single query:

```sql
-- Backup check
SELECT checkout_flow, COUNT(*) FROM products GROUP BY checkout_flow;

-- Execute migration
UPDATE products SET checkout_flow = 'stripe', updated_at = NOW() WHERE checkout_flow != 'stripe' OR checkout_flow IS NULL;

-- Verify
SELECT checkout_flow, COUNT(*) FROM products GROUP BY checkout_flow;
```

3. Verify output shows all 500 products as 'stripe'
4. Done! ✅

---

## 🎯 Summary

**What You're Doing:**
- Changing checkout method from Buy Me a Coffee/Ko-fi/External → Stripe

**Why It's Safe:**
- Only updates one field (`checkout_flow`)
- No data deletion
- Fully reversible

**Time Required:**
- Preview: 2 minutes
- Execute: 5 seconds
- Verify: 1 minute
- **Total: ~5 minutes**

**Impact:**
- All products will now use Stripe for checkout
- Customers will see Stripe payment form
- No manual work for 500 products! 🎉

---

## ✅ Checklist

Before running migration:
- [ ] Backup current state (run Step 1)
- [ ] Review what will change (run Step 2)
- [ ] Verify count matches (run Step 3)

During migration:
- [ ] Execute UPDATE query (run Step 4)
- [ ] Check for "UPDATE 500" message

After migration:
- [ ] Verify all products are 'stripe' (run Step 5)
- [ ] Spot-check 5-10 products (run Step 6)
- [ ] Test checkout on website with one product

---

**File Location:** `migrate_to_stripe_checkout.sql`  
**Status:** ✅ Ready to execute  
**Risk Level:** 🟢 Low (safe migration)  
**Estimated Time:** 5 minutes  

---

**Ready to go! Follow Option 1 (Supabase Dashboard) for the safest approach.** 🚀
