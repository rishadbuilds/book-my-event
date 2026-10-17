const API = import.meta.env.VITE_API_URL

export interface AuthUser { id: string; name: string; email: string; role: string }
export interface AuthResponse { user: AuthUser; accessToken: string }

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Something went wrong')
  return data
}

export const registerUser = (b: { name: string; email: string; password: string }) =>
  post<AuthResponse>('/auth/register', b)

export const loginUser = (b: { email: string; password: string }) =>
  post<AuthResponse>('/auth/login', b)