import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Supabase uses email for authentication, so username should be an email
    // Sign in with Supabase
    const { data, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: username, // Username should be the email address
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminStatus = await isAdmin(data.user.email || '');
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Access denied. Admin access required.' },
        { status: 403 }
      );
    }

    // Create response with token
    const response = NextResponse.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        email: data.user.email,
        id: data.user.id,
      },
    });

    // Set secure HTTP-only cookie for access token
    // Access token expires in 1 hour but we set longer cookie max age
    // because we'll refresh it automatically
    response.cookies.set('admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Store refresh token for session persistence
    // Refresh tokens are valid for much longer (typically 60 days in Supabase)
    response.cookies.set('admin_refresh_token', data.session.refresh_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });

    // Store token expiry time for client-side refresh logic
    response.cookies.set('admin_token_expires', String(data.session.expires_at || ''), {
      httpOnly: false, // Allow client to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

