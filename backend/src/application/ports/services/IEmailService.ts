export interface SendRegistrationOtpInput {
  to: string
  name: string
  otp: string
  expiresInMinutes: number
}

export interface IEmailService {
  sendRegistrationOtp(input: SendRegistrationOtpInput): Promise<void>
}
