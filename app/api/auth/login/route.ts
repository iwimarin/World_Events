import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

interface IRequestPayload {
	payload: MiniAppWalletAuthSuccessPayload
	nonce: string
}

// Create Convex client for API routes
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud");

// Real implementation using Convex database
async function findOrCreateUser(walletAddress: string, payload: MiniAppWalletAuthSuccessPayload) {
	console.log(`Finding or creating user with wallet: ${walletAddress}`);

	// First, check if user already exists
	const existingUser = await convexClient.query(api.auth.getCurrentUser, {
		wallet_address: walletAddress
	});

	if (existingUser) {
		// User exists, return existing user data
		return {
			id: existingUser._id,
			walletAddress: existingUser.wallet_address,
			username: existingUser.username,
			profilePictureUrl: existingUser.profile_picture_url,
			isNewUser: false
		};
	}

	// User doesn't exist, create new user
	// Extract additional user info from payload if available
	const userId = await convexClient.mutation(api.auth.upsertUser, {
		wallet_address: walletAddress,
		username: undefined, // MiniKit doesn't provide username in SIWE payload
		profile_picture_url: undefined, // MiniKit doesn't provide profile picture in SIWE payload
		permissions: undefined,
		opted_into_analytics: undefined,
		world_app_version: undefined,
		device_os: undefined,
	});

	// Get the created user
	const newUser = await convexClient.query(api.auth.getCurrentUser, {
		wallet_address: walletAddress
	});

	if (!newUser) {
		throw new Error("Failed to create user");
	}

	return {
		id: newUser._id,
		walletAddress: newUser.wallet_address,
		username: newUser.username,
		profilePictureUrl: newUser.profile_picture_url,
		isNewUser: true
	};
}

export const POST = async (req: NextRequest) => {
	const { payload, nonce } = (await req.json()) as IRequestPayload
	const cookieStore = await cookies()
	const siwe = cookieStore.get('siwe')

	if (nonce != siwe?.value) {
		return NextResponse.json({
			status: 'error',
			isValid: false,
		})
	}

	try {
		const validMessage = await verifySiweMessage(payload, nonce)

		if (!validMessage.isValid) {
			return NextResponse.json({
				status: 'error',
				isValid: false,
			})
		}

		const walletAddress = payload.address;
		const user = await findOrCreateUser(walletAddress, payload);

		const token = await new SignJWT({
			userId: user.id,
			walletAddress
		})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('7d')
			.setJti(nanoid())
			.sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_replace_in_production'));

		cookieStore.set('auth_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return NextResponse.json({
			status: 'success',
			isValid: true,
			user: {
				id: user.id,
				walletAddress: user.walletAddress,
				username: user.username,
				profilePictureUrl: user.profilePictureUrl,
				isNewUser: user.isNewUser
			}
		})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Handle errors in validation or processing
		return NextResponse.json({
			status: 'error',
			isValid: false,
			message: error.message,
		})
	}
}
