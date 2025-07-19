import Database from '@replit/database'
import { emailService, EMAIL_TEMPLATES } from './mailchimp'

const db = new Database()

interface OTPRecord {
  userId: string
  otp: string
  createdAt: string
  expiresAt: string
  consumed: boolean
  attempts: number
}

interface OTPResult {
  success: boolean
  message: string
}

const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3
const OTP_LENGTH = 6

export class OTPService {
  private generateRandomOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private isOTPExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt)
  }

  async generateOtp(userId: string, userEmail: string): Promise<OTPResult> {
    try {
      if (!userId || !userEmail) {
        return { success: false, message: 'User ID and email are required' }
      }

      const otp = this.generateRandomOTP()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)

      const otpRecord: OTPRecord = {
        userId,
        otp,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        consumed: false,
        attempts: 0
      }

      await db.set(`otp:${userId}`, otpRecord)

      try {
        await emailService.sendTransactionalEmail(
          EMAIL_TEMPLATES.OTP_EMAIL,
          { email: userEmail },
          { otp }
        )

        console.log(`OTP generated and sent to ${userEmail} for user ${userId}`)
        return { success: true, message: 'OTP sent successfully' }
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
        await db.delete(`otp:${userId}`)
        return { success: false, message: 'Failed to send OTP email' }
      }
    } catch (error) {
      console.error('Error generating OTP:', error)
      return { success: false, message: 'Failed to generate OTP' }
    }
  }

  async verifyOtp(userId: string, providedOtp: string): Promise<OTPResult> {
    try {
      if (!userId || !providedOtp) {
        return { success: false, message: 'User ID and OTP are required' }
      }

      const otpRecord = await db.get(`otp:${userId}`) as OTPRecord | null

      if (!otpRecord) {
        return { success: false, message: 'No OTP found for this user' }
      }

      if (otpRecord.consumed) {
        return { success: false, message: 'OTP has already been used' }
      }

      if (this.isOTPExpired(otpRecord.expiresAt)) {
        await db.delete(`otp:${userId}`)
        return { success: false, message: 'OTP has expired' }
      }

      otpRecord.attempts += 1

      if (otpRecord.attempts > MAX_ATTEMPTS) {
        await db.delete(`otp:${userId}`)
        return { success: false, message: 'Too many failed attempts. Please request a new OTP' }
      }

      if (otpRecord.otp !== providedOtp.trim()) {
        await db.set(`otp:${userId}`, otpRecord)
        return { 
          success: false, 
          message: `Invalid OTP. ${MAX_ATTEMPTS - otpRecord.attempts} attempts remaining` 
        }
      }

      otpRecord.consumed = true
      await db.set(`otp:${userId}`, otpRecord)

      setTimeout(async () => {
        try {
          await db.delete(`otp:${userId}`)
        } catch (error) {
          console.error('Error cleaning up consumed OTP:', error)
        }
      }, 5000)

      console.log(`OTP verified successfully for user ${userId}`)
      return { success: true, message: 'OTP verified successfully' }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, message: 'Failed to verify OTP' }
    }
  }

  async resendOtp(userId: string, userEmail: string): Promise<OTPResult> {
    try {
      const existingOtp = await db.get(`otp:${userId}`) as OTPRecord | null

      if (existingOtp && !this.isOTPExpired(existingOtp.expiresAt)) {
        const timeRemaining = Math.ceil(
          (new Date(existingOtp.expiresAt).getTime() - Date.now()) / 1000 / 60
        )
        return { 
          success: false, 
          message: `Please wait ${timeRemaining} minute(s) before requesting a new OTP` 
        }
      }

      await db.delete(`otp:${userId}`)
      return await this.generateOtp(userId, userEmail)
    } catch (error) {
      console.error('Error resending OTP:', error)
      return { success: false, message: 'Failed to resend OTP' }
    }
  }

  async deleteOtp(userId: string): Promise<void> {
    try {
      await db.delete(`otp:${userId}`)
      console.log(`OTP deleted for user ${userId}`)
    } catch (error) {
      console.error('Error deleting OTP:', error)
    }
  }

  async cleanupExpiredOtps(): Promise<number> {
    try {
      const keys = await db.list('otp:')
      let cleanedCount = 0

      for (const key of keys) {
        const otpRecord = await db.get(key) as OTPRecord | null
        if (otpRecord && this.isOTPExpired(otpRecord.expiresAt)) {
          await db.delete(key)
          cleanedCount++
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired OTPs`)
      }

      return cleanedCount
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error)
      return 0
    }
  }

  async getOtpStatus(userId: string): Promise<{
    exists: boolean
    expired?: boolean
    attemptsRemaining?: number
    timeRemaining?: number
  }> {
    try {
      const otpRecord = await db.get(`otp:${userId}`) as OTPRecord | null

      if (!otpRecord) {
        return { exists: false }
      }

      const expired = this.isOTPExpired(otpRecord.expiresAt)
      const timeRemaining = expired ? 0 : Math.ceil(
        (new Date(otpRecord.expiresAt).getTime() - Date.now()) / 1000 / 60
      )

      return {
        exists: true,
        expired,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - otpRecord.attempts),
        timeRemaining
      }
    } catch (error) {
      console.error('Error getting OTP status:', error)
      return { exists: false }
    }
  }
}

export const otpService = new OTPService()
export default otpService

export interface User2FA {
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
  lastOtpSent?: string
}

export function shouldRequire2FA(user: any): boolean {
  return user.role === 'admin' || (user.twoFactorEnabled === true)
}

export async function verify2FA(userId: string, userEmail: string, providedOtp?: string): Promise<{
  required: boolean
  verified: boolean
  message: string
}> {
  try {
    const user = await import('./db').then(({ userDb }) => userDb.findById(userId))
    
    if (!user) {
      return { required: false, verified: false, message: 'User not found' }
    }

    const requires2FA = shouldRequire2FA(user)

    if (!requires2FA) {
      return { required: false, verified: true, message: '2FA not required' }
    }

    if (!providedOtp) {
      const result = await otpService.generateOtp(userId, userEmail)
      return { 
        required: true, 
        verified: false, 
        message: result.success ? 'OTP sent to your email' : result.message 
      }
    }

    const result = await otpService.verifyOtp(userId, providedOtp)
    return { 
      required: true, 
      verified: result.success, 
      message: result.message 
    }
  } catch (error) {
    console.error('Error in 2FA verification:', error)
    return { required: false, verified: false, message: 'Verification failed' }
  }
}