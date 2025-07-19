import { notificationService } from './notification-service'
import { userDb, orderDb, productDb, planDb, cartDb } from './db'
import { emailService } from './mailchimp'
import { otpService } from './otp'

interface ValidationResult {
  passed: boolean
  message: string
  details?: any
}

interface TestResults {
  overall: boolean
  tests: Record<string, ValidationResult>
}

export class EmailValidation {
  
  async validateEmailService(): Promise<ValidationResult> {
    try {
      const connectionStatus = await emailService.testConnection()
      
      if (!connectionStatus.mailchimp && !connectionStatus.smtp) {
        return {
          passed: false,
          message: 'No email service configured (neither Mailchimp nor SMTP)',
          details: connectionStatus
        }
      }

      return {
        passed: true,
        message: `Email service configured: ${connectionStatus.mailchimp ? 'Mailchimp' : 'SMTP'}`,
        details: connectionStatus
      }
    } catch (error) {
      return {
        passed: false,
        message: `Email service validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async validateUserNotificationFlags(): Promise<ValidationResult> {
    try {
      const users = await userDb.getAll()
      const usersWithFlags = users.filter(user => 
        user.hasOwnProperty('notifyOrder') || 
        user.hasOwnProperty('notifyStatus') || 
        user.hasOwnProperty('notifyMarketing')
      )

      if (usersWithFlags.length === 0 && users.length > 0) {
        return {
          passed: false,
          message: 'No users have notification flags set',
          details: { totalUsers: users.length, usersWithFlags: 0 }
        }
      }

      return {
        passed: true,
        message: `${usersWithFlags.length}/${users.length} users have notification flags`,
        details: { totalUsers: users.length, usersWithFlags: usersWithFlags.length }
      }
    } catch (error) {
      return {
        passed: false,
        message: `User flag validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async validatePlanBasedGating(): Promise<ValidationResult> {
    try {
      const testUserId = 'test-user-123'
      const testUserEmail = 'test@example.com'
      
      const freePlan = await planDb.get(testUserId)
      freePlan.tier = 'Free'
      
      const testUser = {
        id: testUserId,
        email: testUserEmail,
        notifyMarketing: true,
        notifyStatus: true,
        role: 'buyer' as const,
        passwordHash: 'test',
        is_verified: true,
        createdAt: new Date().toISOString()
      }

      const canSendMarketing = await (notificationService as any).canSendEmail(
        testUser, 
        freePlan, 
        'marketing'
      )

      const canSendTransactional = await (notificationService as any).canSendEmail(
        testUser,
        freePlan,
        'transactional'
      )

      if (canSendMarketing) {
        return {
          passed: false,
          message: 'Free plan users should not receive marketing emails',
          details: { canSendMarketing, canSendTransactional }
        }
      }

      if (!canSendTransactional) {
        return {
          passed: false,
          message: 'All users should receive transactional emails',
          details: { canSendMarketing, canSendTransactional }
        }
      }

      return {
        passed: true,
        message: 'Plan-based gating working correctly',
        details: { canSendMarketing, canSendTransactional }
      }
    } catch (error) {
      return {
        passed: false,
        message: `Plan gating validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async validateCartTimestamps(): Promise<ValidationResult> {
    try {
      const carts = await cartDb.getAbandonedCarts()
      let validTimestamps = 0
      let invalidTimestamps = 0

      for (const { cart } of carts) {
        try {
          const updatedAt = new Date(cart.updatedAt)
          if (isNaN(updatedAt.getTime())) {
            invalidTimestamps++
          } else {
            validTimestamps++
          }
        } catch {
          invalidTimestamps++
        }
      }

      if (invalidTimestamps > 0) {
        return {
          passed: false,
          message: `${invalidTimestamps} carts have invalid timestamps`,
          details: { validTimestamps, invalidTimestamps, totalCarts: carts.length }
        }
      }

      return {
        passed: true,
        message: `All ${validTimestamps} cart timestamps are valid`,
        details: { validTimestamps, invalidTimestamps, totalCarts: carts.length }
      }
    } catch (error) {
      return {
        passed: false,
        message: `Cart timestamp validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async validateOTPSecurity(): Promise<ValidationResult> {
    try {
      const testUserId = 'test-otp-user'
      const testUserEmail = 'test-otp@example.com'
      
      const generateResult = await otpService.generateOtp(testUserId, testUserEmail)
      
      if (!generateResult.success) {
        return {
          passed: false,
          message: 'OTP generation failed during validation',
          details: generateResult
        }
      }

      const status1 = await otpService.getOtpStatus(testUserId)
      if (!status1.exists) {
        return {
          passed: false,
          message: 'OTP not found after generation',
          details: status1
        }
      }

      const invalidVerify = await otpService.verifyOtp(testUserId, '000000')
      if (invalidVerify.success) {
        return {
          passed: false,
          message: 'Invalid OTP was accepted',
          details: invalidVerify
        }
      }

      await otpService.deleteOtp(testUserId)
      
      const status2 = await otpService.getOtpStatus(testUserId)
      if (status2.exists) {
        return {
          passed: false,
          message: 'OTP still exists after deletion',
          details: status2
        }
      }

      return {
        passed: true,
        message: 'OTP security validation passed',
        details: { generateResult, invalidVerify, cleanupStatus: status2 }
      }
    } catch (error) {
      return {
        passed: false,
        message: `OTP security validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async validateEmailTemplates(): Promise<ValidationResult> {
    try {
      const testVariables = {
        orderId: 'test-123',
        buyerEmail: 'buyer@test.com',
        totalPrice: 99.99,
        itemCount: 2,
        orderDate: new Date().toISOString(),
        status: 'shipped',
        otp: '123456'
      }

      const templates = [
        'ORDER_NOTIFY_SELLER',
        'STATUS_NOTIFY_BUYER', 
        'ADMIN_ALERT_NEW_SELLER',
        'CART_REMINDER_BUYER',
        'OTP_EMAIL'
      ]

      const results = []

      for (const templateId of templates) {
        try {
          const template = (emailService as any).getEmailTemplate(templateId, testVariables)
          
          if (!template.subject || !template.html) {
            results.push({ templateId, error: 'Missing subject or HTML content' })
          } else if (template.html.includes('undefined') || template.subject.includes('undefined')) {
            results.push({ templateId, error: 'Template contains undefined values' })
          } else {
            results.push({ templateId, status: 'valid' })
          }
        } catch (error) {
          results.push({ templateId, error: String(error) })
        }
      }

      const failedTemplates = results.filter(r => r.error)
      
      if (failedTemplates.length > 0) {
        return {
          passed: false,
          message: `${failedTemplates.length} email templates failed validation`,
          details: results
        }
      }

      return {
        passed: true,
        message: `All ${templates.length} email templates are valid`,
        details: results
      }
    } catch (error) {
      return {
        passed: false,
        message: `Email template validation failed: ${error}`,
        details: { error: String(error) }
      }
    }
  }

  async runFullValidation(): Promise<TestResults> {
    console.log('🛑 Starting comprehensive email system validation...')
    
    const tests: Record<string, ValidationResult> = {}

    tests.emailService = await this.validateEmailService()
    tests.userFlags = await this.validateUserNotificationFlags()
    tests.planGating = await this.validatePlanBasedGating()
    tests.cartTimestamps = await this.validateCartTimestamps()
    tests.otpSecurity = await this.validateOTPSecurity()
    tests.emailTemplates = await this.validateEmailTemplates()

    const allPassed = Object.values(tests).every(test => test.passed)

    console.log('✅ Validation Results:')
    for (const [testName, result] of Object.entries(tests)) {
      console.log(`  ${result.passed ? '✅' : '❌'} ${testName}: ${result.message}`)
    }

    return {
      overall: allPassed,
      tests
    }
  }
}

export const emailValidation = new EmailValidation()
export default emailValidation