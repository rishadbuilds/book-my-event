export enum ServiceCategory {
  VENUE = 'venue',
  HOTEL = 'hotel',
  CATERING = 'catering',
  PHOTOGRAPHY = 'photography',
  DJ = 'dj',
  DECORATION = 'decoration',
  EVENT_PLANNER = 'event-planner',
}

export enum PriceUnit {
  PER_EVENT = 'per-event',
  PER_DAY = 'per-day',
  PER_PERSON = 'per-person',
  PER_HOUR = 'per-hour',
}

export enum ServiceSort {
  NEWEST = 'newest',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
}

export const SERVICE_CATEGORY_VALUES = Object.values(ServiceCategory)
export const PRICE_UNIT_VALUES = Object.values(PriceUnit)
export const SERVICE_SORT_VALUES = Object.values(ServiceSort)

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  [ServiceCategory.VENUE]: 'Venues',
  [ServiceCategory.HOTEL]: 'Hotels & Resorts',
  [ServiceCategory.CATERING]: 'Catering',
  [ServiceCategory.PHOTOGRAPHY]: 'Photography',
  [ServiceCategory.DJ]: 'DJs & Music',
  [ServiceCategory.DECORATION]: 'Decoration',
  [ServiceCategory.EVENT_PLANNER]: 'Event Planners',
}

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  [PriceUnit.PER_EVENT]: 'per event',
  [PriceUnit.PER_DAY]: 'per day',
  [PriceUnit.PER_PERSON]: 'per person',
  [PriceUnit.PER_HOUR]: 'per hour',
}
