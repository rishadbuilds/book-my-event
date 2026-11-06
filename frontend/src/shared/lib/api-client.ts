import { tokenStorage } from './token-storage'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export interface ApiErrorBody {
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export class ApiError extends Error {
  readonly status: number
  readonly fields: Record<string, string>

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const errorBody = (body ?? {}) as ApiErrorBody
    const fields = (errorBody.errors ?? []).reduce<Record<string, string>>(
      (acc, item) => {
        if (item.field && !acc[item.field]) acc[item.field] = item.message
        return acc
      },
      {},
    )

    throw new ApiError(
      errorBody.message ?? 'Something went wrong. Please try again.',
      response.status,
      fields,
    )
  }

  return body as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
