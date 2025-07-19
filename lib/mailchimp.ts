import nodemailer from 'nodemailer'

interface MailchimpConfig {
  apiKey?: string
  serverPrefix?: string
}

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

interface EmailRecipient {
  email: string
  name?: string
}

export const EMAIL_TEMPLATES = {
  ORDER_NOTIFY_SELLER: 'order_notify_seller',
  STATUS_NOTIFY_BUYER: 'status_notify_buyer',
  ADMIN_ALERT_NEW_SELLER: 'admin_alert_new_seller',
  CART_REMINDER_BUYER: 'cart_reminder_buyer',
  OTP_EMAIL: 'otp_email',
  MARKETING_EMAIL: 'marketing_email'
} as const

type EmailTemplateType = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES]

class EmailService {
  private mailchimpConfig: MailchimpConfig
  private smtpTransporter: nodemailer.Transporter | null = null
  private useMailchimp: boolean = false

  constructor() {
    this.mailchimpConfig = {
      apiKey: process.env.MAILCHIMP_API_KEY,
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX
    }

    this.useMailchimp = !!(this.mailchimpConfig.apiKey && this.mailchimpConfig.serverPrefix)

    if (!this.useMailchimp) {
      this.initializeSMTP()
    }
  }

  private initializeSMTP() {
    try {
      const smtpConfig: SmtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      }

      if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.warn('SMTP credentials not configured. Email functionality will be limited.')
        return
      }

      this.smtpTransporter = nodemailer.createTransporter(smtpConfig)
    } catch (error) {
      console.error('Failed to initialize SMTP transporter:', error)
    }
  }

  private getEmailTemplate(templateId: EmailTemplateType, variables: Record<string, any>): EmailTemplate {
    switch (templateId) {
      case EMAIL_TEMPLATES.ORDER_NOTIFY_SELLER:
        return {
          subject: `New Order #${variables.orderId} - ${variables.buyerEmail}`,
          html: `
            <h2>New Order Received</h2>
            <p>You have received a new order:</p>
            <ul>
              <li><strong>Order ID:</strong> ${variables.orderId}</li>
              <li><strong>Buyer:</strong> ${variables.buyerEmail}</li>
              <li><strong>Total:</strong> $${variables.totalPrice}</li>
              <li><strong>Items:</strong> ${variables.itemCount} items</li>
              <li><strong>Order Date:</strong> ${new Date(variables.orderDate).toLocaleString()}</li>
            </ul>
            <p>Please review and process this order in your seller dashboard.</p>
          `,
          text: `New Order #${variables.orderId} from ${variables.buyerEmail}. Total: $${variables.totalPrice}. Items: ${variables.itemCount}`
        }

      case EMAIL_TEMPLATES.STATUS_NOTIFY_BUYER:
        return {
          subject: `Order Update - #${variables.orderId}`,
          html: `
            <h2>Order Status Update</h2>
            <p>Your order status has been updated:</p>
            <ul>
              <li><strong>Order ID:</strong> ${variables.orderId}</li>
              <li><strong>New Status:</strong> ${variables.status}</li>
              <li><strong>Total:</strong> $${variables.totalPrice}</li>
            </ul>
            ${variables.trackingNumber ? `<p><strong>Tracking Number:</strong> ${variables.trackingNumber}</p>` : ''}
            <p>You can view your order details in your account dashboard.</p>
          `,
          text: `Order #${variables.orderId} status updated to: ${variables.status}`
        }

      case EMAIL_TEMPLATES.ADMIN_ALERT_NEW_SELLER:
        return {
          subject: `New Seller Registration - ${variables.companyName}`,
          html: `
            <h2>New Seller Registration</h2>
            <p>A new seller has registered and requires verification:</p>
            <ul>
              <li><strong>Company:</strong> ${variables.companyName}</li>
              <li><strong>Email:</strong> ${variables.email}</li>
              <li><strong>Registration Number:</strong> ${variables.registrationNumber}</li>
              <li><strong>Submitted:</strong> ${new Date(variables.submittedAt).toLocaleString()}</li>
            </ul>
            <p>Please review and verify this seller in the admin dashboard.</p>
          `,
          text: `New seller registration: ${variables.companyName} (${variables.email}) requires verification`
        }

      case EMAIL_TEMPLATES.CART_REMINDER_BUYER:
        return {
          subject: `Don't forget your cart - ${variables.itemCount} items waiting`,
          html: `
            <h2>Your Cart is Waiting</h2>
            <p>You have ${variables.itemCount} items in your cart that are ready to order:</p>
            <p><strong>Total Value:</strong> $${variables.totalValue}</p>
            <p>Complete your purchase before these items are gone!</p>
            <a href="${variables.cartUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Cart</a>
          `,
          text: `You have ${variables.itemCount} items in your cart worth $${variables.totalValue}. Complete your purchase now!`
        }

      case EMAIL_TEMPLATES.OTP_EMAIL:
        return {
          subject: 'Your verification code',
          html: `
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; color: #007bff; letter-spacing: 5px;">${variables.otp}</h1>
            <p>This code expires in 5 minutes.</p>
            <p><strong>Note:</strong> Do not share this code with anyone.</p>
          `,
          text: `Your verification code is: ${variables.otp}. This code expires in 5 minutes.`
        }

      case EMAIL_TEMPLATES.MARKETING_EMAIL:
        return {
          subject: variables.subject || 'Special Offer',
          html: variables.html || `
            <h2>${variables.title || 'Special Offer'}</h2>
            <p>${variables.message || 'Check out our latest deals!'}</p>
          `,
          text: variables.text || variables.message || 'Check out our latest deals!'
        }

      default:
        throw new Error(`Unknown email template: ${templateId}`)
    }
  }

  async subscribeToList(email: string, listId: string): Promise<void> {
    if (this.useMailchimp) {
      try {
        const response = await fetch(
          `https://${this.mailchimpConfig.serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.mailchimpConfig.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email_address: email,
              status: 'subscribed'
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`Mailchimp API error: ${error.detail || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Failed to subscribe to Mailchimp list:', error)
        throw error
      }
    } else {
      console.warn('Mailchimp not configured. Subscription skipped.')
    }
  }

  async sendTransactionalEmail(
    templateId: EmailTemplateType,
    recipient: EmailRecipient,
    variables: Record<string, any>
  ): Promise<void> {
    try {
      const template = this.getEmailTemplate(templateId, variables)

      if (this.useMailchimp) {
        await this.sendViaMailchimp(template, recipient, variables)
      } else if (this.smtpTransporter) {
        await this.sendViaSMTP(template, recipient)
      } else {
        console.error('No email service configured. Email not sent.')
        throw new Error('Email service not available')
      }
    } catch (error) {
      console.error(`Failed to send email ${templateId} to ${recipient.email}:`, error)
      throw error
    }
  }

  private async sendViaMailchimp(
    template: EmailTemplate,
    recipient: EmailRecipient,
    variables: Record<string, any>
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://${this.mailchimpConfig.serverPrefix}.api.mailchimp.com/3.0/messages/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.mailchimpConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: {
              html: template.html,
              text: template.text,
              subject: template.subject,
              from_email: process.env.FROM_EMAIL || 'noreply@mshop.com',
              from_name: process.env.FROM_NAME || 'mshop Marketplace',
              to: [{
                email: recipient.email,
                name: recipient.name,
                type: 'to'
              }]
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Mailchimp send error: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Mailchimp send failed, falling back to SMTP:', error)
      if (this.smtpTransporter) {
        await this.sendViaSMTP(template, recipient)
      } else {
        throw error
      }
    }
  }

  private async sendViaSMTP(template: EmailTemplate, recipient: EmailRecipient): Promise<void> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized')
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'mshop Marketplace'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: recipient.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    }

    await this.smtpTransporter.sendMail(mailOptions)
  }

  async testConnection(): Promise<{ mailchimp: boolean; smtp: boolean }> {
    const result = { mailchimp: false, smtp: false }

    if (this.useMailchimp) {
      try {
        const response = await fetch(
          `https://${this.mailchimpConfig.serverPrefix}.api.mailchimp.com/3.0/ping`,
          {
            headers: {
              'Authorization': `Bearer ${this.mailchimpConfig.apiKey}`
            }
          }
        )
        result.mailchimp = response.ok
      } catch (error) {
        console.error('Mailchimp connection test failed:', error)
      }
    }

    if (this.smtpTransporter) {
      try {
        await this.smtpTransporter.verify()
        result.smtp = true
      } catch (error) {
        console.error('SMTP connection test failed:', error)
      }
    }

    return result
  }
}

export const emailService = new EmailService()
export default emailService