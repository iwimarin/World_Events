import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

// Create Convex client for API routes
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud");

// Real implementation using Convex database
async function getUserByWallet(walletAddress: string) {
    console.log(`Getting user with wallet: ${walletAddress}`);

    try {
        const user = await convexClient.query(api.auth.getCurrentUser, {
            wallet_address: walletAddress
        });

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            walletAddress: user.wallet_address,
            username: user.username,
            profilePictureUrl: user.profile_picture_url,
            isAdmin: user.is_admin || false,
            isNewUser: false
        };
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');
        
        if (!token) {
            return NextResponse.json({ 
                authenticated: false,
                message: 'Not authenticated' 
            }, { status: 401 });
        }
        
        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_replace_in_production')
        );
        
        if (!payload.walletAddress) {
            return NextResponse.json({ 
                authenticated: false,
                message: 'Invalid token' 
            }, { status: 401 });
        }

        const user = await getUserByWallet(payload.walletAddress as string);
        
        if (!user) {
            return NextResponse.json({ 
                authenticated: false,
                message: 'User not found' 
            }, { status: 401 });
        }
        
        return NextResponse.json({
            authenticated: true,
            user: user
        });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ 
            authenticated: false,
            message: 'Authentication error' 
        }, { status: 401 });
    }
}
