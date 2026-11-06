import type { Service } from '../../domain/entities/Service.js'
import type { UserSummary } from '../../domain/entities/UserSummary.js'
import {
  PRICE_UNIT_LABELS,
  SERVICE_CATEGORY_LABELS,
} from '../../shared/constants/Service.js'
import type { ServiceResponseDto } from '../dtos/service.dto.js'

export class ServiceMapper {
  static toResponse(
    service: Service,
    provider: UserSummary | null,
  ): ServiceResponseDto {
    return {
      id: service.id,
      providerId: service.providerId,
      provider: provider
        ? {
            id: provider.id,
            name: provider.name,
            businessName: provider.businessName,
            avatarUrl: provider.avatarUrl,
            bio: provider.bio,
          }
        : null,
      name: service.name,
      slug: service.slug,
      category: service.category,
      categoryLabel: SERVICE_CATEGORY_LABELS[service.category],
      description: service.description,
      images: [...service.images],
      location: service.location,
      price: service.price,
      priceUnit: service.priceUnit,
      priceUnitLabel: PRICE_UNIT_LABELS[service.priceUnit],
      contact: {
        phone: service.contact.phone,
        email: service.contact.email,
      },
      allowsMultipleBookings: service.allowsMultipleBookings,
      blockedDates: service.blockedDates.map((date) => date.toISOString()),
      isActive: service.isActive,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }
  }
}
