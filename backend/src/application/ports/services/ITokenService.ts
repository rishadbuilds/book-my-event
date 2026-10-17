export interface TokenPayload { sub: string; role: string }

export interface ITokenService {
  sign(payload: TokenPayload): string
  verify(token: string): TokenPayload
}
