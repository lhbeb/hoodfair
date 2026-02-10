import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, logAdminAction } from '@/lib/supabase/admin-auth';
import { sign } from 'jsonwebtoken';

// JWT secret for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate admin using the new RBAC system
    const authResult = await authenticateAdmin(username, password);

    if (!authResult.success || !authResult.admin) {
      // Log failed attempt
      await logAdminAction(
        username,
        'LOGIN_FAILED',
        null,
        null,
        { reason: authResult.error || 'Invalid credentials' },
        ipAddress,
        userAgent,
        'FAILED'
      );

      return NextResponse.json(
        { error: authResult.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const admin = authResult.admin;

    // Create JWT token with admin data
    const token = sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // Create response with token
    const response = NextResponse.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        metadata: admin.metadata,
      },
    });

    // Set secure HTTP-only cookie for access token
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Store admin role in a separate cookie (readable by client for UI purposes)
    response.cookies.set('admin_role', admin.role, {
      httpOnly: false, // Allow client to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Store admin email in cookie (for display purposes)
    response.cookies.set('admin_email', admin.email, {
      httpOnly: false, // Allow client to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Log successful login (already logged in authenticateAdmin, but log again with IP/UA)
    await logAdminAction(
      admin.email,
      'LOGIN_SUCCESS',
      null,
      null,
      { role: admin.role },
      ipAddress,
      userAgent,
      'SUCCESS'
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
