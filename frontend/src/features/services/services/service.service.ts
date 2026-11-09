import { apiClient } from '@/shared/lib/api-client'
import { buildQuery } from '@/shared/lib/format'
import type { PaginationMeta } from '@/shared/types/pagination.types'
import type {
  Service,
  ServiceInput,
  ServiceListQuery,
  ServiceMeta,
  ServiceUpdateInput,
} from '../types/service.types'

export const serviceService = {
  list: (query: ServiceListQuery = {}) =>
    apiClient.getList<Service[], PaginationMeta>(
      `/services${buildQuery({
        q: query.q,
        category: query.category,
        location: query.location,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        date: query.date,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      })}`,
    ),

  meta: () => apiClient.get<ServiceMeta>('/services/meta'),

  getBySlug: (slug: string) =>
    apiClient.get<Service>(`/services/${encodeURIComponent(slug)}`),

  providerList: (query: { q?: string; page?: number; limit?: number } = {}) =>
    apiClient.getList<Service[], PaginationMeta>(
      `/provider/services${buildQuery(query)}`,
    ),

  getProviderService: (id: string) =>
    apiClient.get<Service>(`/provider/services/${id}`),

  create: (input: ServiceInput) => apiClient.post<Service>('/services', input),

  update: (id: string, input: ServiceUpdateInput) =>
    apiClient.patch<Service>(`/services/${id}`, input),

  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/services/${id}`),

  uploadImages: async (files: File[]) => {
    const formData = new FormData()
    for (const file of files) formData.append('images', file)
    return apiClient.upload<{ images: string[] }>('/uploads/images', formData)
  },
}
