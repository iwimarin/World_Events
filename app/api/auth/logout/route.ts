import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

export async function POST() {
    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', '', { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
    });
    
    return NextResponse.json({ 
        success: true,
        message: 'Logged out successfully' 
    });
}
