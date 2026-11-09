import { tokenStorage } from './token-storage'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api'

interface ApiEnvelope<T, M> {
  data: T
  meta?: M
}

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

async function send<T, M = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T, M>> {
  const token = tokenStorage.get()
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  if (body && typeof body === 'object' && 'data' in body) {
    return body as ApiEnvelope<T, M>
  }

  return { data: body as T }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const envelope = await send<T>(path, init)
  return envelope.data
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  /** GET that also returns the pagination `meta` block. */
  getList: async <T, M>(path: string): Promise<{ data: T; meta: M }> => {
    const envelope = await send<T, M>(path)
    return { data: envelope.data, meta: envelope.meta as M }
  },

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Multipart upload; the browser sets the boundary header itself. */
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}
