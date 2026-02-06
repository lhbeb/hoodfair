import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('admin_refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token found' },
                { status: 401 }
            );
        }

        // Refresh the session using the refresh token
        const { data, error } = await supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error || !data.session) {
            // Clear cookies if refresh fails
            const response = NextResponse.json(
                { error: 'Session expired. Please login again.' },
                { status: 401 }
            );
            response.cookies.delete('admin_token');
            response.cookies.delete('admin_refresh_token');
            response.cookies.delete('admin_token_expires');
            return response;
        }

        // Verify user is still an admin
        const adminStatus = await isAdmin(data.user?.email || '');
        if (!adminStatus) {
            const response = NextResponse.json(
                { error: 'Access denied. Admin access required.' },
                { status: 403 }
            );
            response.cookies.delete('admin_token');
            response.cookies.delete('admin_refresh_token');
            response.cookies.delete('admin_token_expires');
            return response;
        }

        // Create response with new tokens
        const response = NextResponse.json({
            token: data.session.access_token,
            expiresAt: data.session.expires_at,
            user: {
                email: data.user?.email,
                id: data.user?.id,
            },
        });

        // Update access token cookie
        response.cookies.set('admin_token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        // Update refresh token cookie (Supabase may rotate it)
        response.cookies.set('admin_refresh_token', data.session.refresh_token || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 60, // 60 days
            path: '/',
        });

        // Update token expiry time
        response.cookies.set('admin_token_expires', String(data.session.expires_at || ''), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 60, // 60 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Failed to refresh session' },
            { status: 500 }
        );
    }
}
