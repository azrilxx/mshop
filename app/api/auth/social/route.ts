
import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { userDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { provider, profile } = await request.json()

    if (!provider || !profile) {
      return NextResponse.json(
        { error: 'Provider and profile data required' },
        { status: 400 }
      )
    }

    // Check if user exists with this social provider
    let user = await userDb.findByEmail(profile.email)

    if (!user) {
      // Create new user with social provider data
      user = await userDb.create(
        profile.email,
        null, // No password for social login
        'buyer', // Default role
        {
          fullName: profile.name,
          socialProvider: provider,
          socialId: profile.id,
          profileImage: profile.picture || profile.avatar_url,
          isVerified: true // Social accounts are pre-verified
        }
      )
    } else if (!user.socialProvider) {
      // Link social account to existing user
      await userDb.updateUser(profile.email, {
        socialProvider: provider,
        socialId: profile.id,
        profileImage: profile.picture || profile.avatar_url || user.profileImage
      })
    }

    await createSession(user)

    return NextResponse.json(
      { 
        message: 'Social login successful',
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName 
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Social login error:', error)
    return NextResponse.json(
      { error: error.message || 'Social login failed' },
      { status: 500 }
    )
  }
}
