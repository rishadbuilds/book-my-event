import { injectable } from 'tsyringe'
import type {
  IEmailService,
  SendRegistrationOtpInput,
} from '../../application/ports/services/IEmailService.js'

/**
 * Development adapter. Prints the OTP to the API logs so the flow works
 * without SMTP credentials.
 */
@injectable()
export class ConsoleEmailService implements IEmailService {
  async sendRegistrationOtp(input: SendRegistrationOtpInput): Promise<void> {
    console.log(
      [
        '',
        '📧  ------------------------------------------------------------',
        `    To:      ${input.name} <${input.to}>`,
        `    Subject: Your BookMyEvent verification code`,
        `    Code:    ${input.otp}  (valid for ${input.expiresInMinutes} min)`,
        '    Tip: set SMTP_HOST to send real emails.',
        '    ------------------------------------------------------------',
        '',
      ].join('\n'),
    )
  }
}
