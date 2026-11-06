import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { ServiceMetaDto } from '../../dtos/service.dto.js'
import {
  PRICE_UNIT_LABELS,
  PRICE_UNIT_VALUES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_VALUES,
} from '../../../shared/constants/Service.js'

@injectable()
export class GetServiceMeta {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
  ) {}

  async execute(): Promise<ServiceMetaDto> {
    const facets = await this.services.getFacets()

    return {
      categories: SERVICE_CATEGORY_VALUES.map((value) => ({
        value,
        label: SERVICE_CATEGORY_LABELS[value],
      })),
      locations: facets.locations,
      priceRange: {
        min: facets.minPrice,
        max: facets.maxPrice,
      },
      priceUnits: PRICE_UNIT_VALUES.map((value) => ({
        value,
        label: PRICE_UNIT_LABELS[value],
      })),
    }
  }
}
