import nodemailer, { type Transporter } from 'nodemailer'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../application/ports/tokens.js'
import type {
  IEmailService,
  SendRegistrationOtpInput,
} from '../../application/ports/services/IEmailService.js'
import type { Env } from '../config/env.config.js'

@injectable()
export class SmtpEmailService implements IEmailService {
  private readonly transporter: Transporter
  private readonly from: string

  constructor(@inject(TOKENS.Config) config: Env) {
    if (!config.smtp) {
      throw new Error('SmtpEmailService requires SMTP configuration')
    }

    this.from = config.smtp.from
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth:
        config.smtp.user && config.smtp.pass
          ? { user: config.smtp.user, pass: config.smtp.pass }
          : undefined,
    })
  }

  async sendRegistrationOtp(input: SendRegistrationOtpInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: 'Your BookMyEvent verification code',
      text: `Hi ${input.name},\n\nYour BookMyEvent verification code is ${input.otp}. It expires in ${input.expiresInMinutes} minutes.\n\nIf you didn't request this, you can ignore this email.`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#7c3aed;margin:0 0 12px">BookMyEvent</h2>
          <p>Hi ${input.name},</p>
          <p>Your verification code is:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${input.otp}</p>
          <p style="color:#6b7280">This code expires in ${input.expiresInMinutes} minutes. If you didn't request it, you can ignore this email.</p>
        </div>
      `,
    })
  }
}
