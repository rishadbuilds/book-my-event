import { injectable } from 'tsyringe'
import { Types, type HydratedDocument, type mongo } from 'mongoose'
import type {
  CreateServiceData,
  IServiceRepository,
  ServiceFacets,
  ServiceFilters,
  ServicePage,
  UpdateServiceData,
} from '../../../application/ports/repositories/IServiceRepository.js'
import type { Service } from '../../../domain/entities/Service.js'
import { ServiceSort } from '../../../shared/constants/Service.js'
import { endOfUtcDay, startOfUtcDay } from '../../../shared/utils/date.js'
import { escapeRegExp } from '../../../shared/utils/regex.js'
import { slugify } from '../../../shared/utils/slug.js'
import { ServiceModel, type ServiceDocument } from '../models/ServiceModel.js'

function toEntity(document: HydratedDocument<ServiceDocument>): Service {
  return {
    id: document.id,
    providerId: document.providerId.toString(),
    name: document.name,
    slug: document.slug,
    category: document.category,
    description: document.description,
    images: [...document.images],
    location: document.location,
    price: document.price,
    priceUnit: document.priceUnit,
    contact: {
      phone: document.contact.phone,
      email: document.contact.email,
    },
    allowsMultipleBookings: document.allowsMultipleBookings,
    blockedDates: [...document.blockedDates],
    isActive: document.isActive,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

@injectable()
export class MongoServiceRepository implements IServiceRepository {
  /** Appends a numeric suffix until the slug is free. */
  private async uniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name)
    let candidate = base
    let suffix = 2

    while (
      await ServiceModel.exists({
        slug: candidate,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      })
    ) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }

    return candidate
  }

  async create(data: CreateServiceData): Promise<Service> {
    const document = await ServiceModel.create({
      providerId: new Types.ObjectId(data.providerId),
      name: data.name,
      slug: await this.uniqueSlug(data.name),
      category: data.category,
      description: data.description,
      images: data.images ?? [],
      location: data.location,
      price: data.price,
      priceUnit: data.priceUnit,
      contact: data.contact,
      allowsMultipleBookings: data.allowsMultipleBookings ?? false,
      blockedDates: data.blockedDates ?? [],
      isActive: data.isActive ?? true,
    })

    return toEntity(document)
  }

  async findById(id: string): Promise<Service | null> {
    const document = await ServiceModel.findById(id).exec()
    return document ? toEntity(document) : null
  }

  async findBySlug(slug: string): Promise<Service | null> {
    const document = await ServiceModel.findOne({
      slug: slug.toLowerCase(),
    }).exec()
    return document ? toEntity(document) : null
  }

  async findMany(filters: ServiceFilters): Promise<ServicePage> {
    const query: mongo.Filter<ServiceDocument> = {}

    if (filters.activeOnly !== false) query.isActive = true
    if (filters.providerId) {
      query.providerId = new Types.ObjectId(filters.providerId)
    }
    if (filters.category) query.category = filters.category

    if (filters.search) {
      const term = escapeRegExp(filters.search)
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
      ]
    }

    if (filters.location) {
      query.location = {
        $regex: `^${escapeRegExp(filters.location)}$`,
        $options: 'i',
      }
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {
        ...(filters.minPrice !== undefined
          ? { $gte: filters.minPrice }
          : {}),
        ...(filters.maxPrice !== undefined
          ? { $lte: filters.maxPrice }
          : {}),
      }
    }

    if (filters.date) {
      const start = startOfUtcDay(filters.date)
      query.blockedDates = {
        $not: { $elemMatch: { $gte: start, $lt: endOfUtcDay(filters.date) } },
      }
    }

    const sortBy: Record<string, 1 | -1> =
      filters.sort === ServiceSort.PRICE_ASC
        ? { price: 1, createdAt: -1 }
        : filters.sort === ServiceSort.PRICE_DESC
          ? { price: -1, createdAt: -1 }
          : { createdAt: -1 }

    const skip = (filters.page - 1) * filters.limit

    const [documents, total] = await Promise.all([
      ServiceModel.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      ServiceModel.countDocuments(query).exec(),
    ])

    return { items: documents.map(toEntity), total }
  }

  async getFacets(): Promise<ServiceFacets> {
    const [locations, priceRows] = await Promise.all([
      ServiceModel.distinct('location', { isActive: true }).exec(),
      ServiceModel.aggregate<{
        _id: null
        minPrice: number
        maxPrice: number
      }>([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        },
      ]).exec(),
    ])

    return {
      locations: (locations as string[]).sort((a, b) => a.localeCompare(b)),
      minPrice: priceRows[0]?.minPrice ?? null,
      maxPrice: priceRows[0]?.maxPrice ?? null,
    }
  }

  async findByProvider(providerId: string): Promise<Service[]> {
    const documents = await ServiceModel.find({
      providerId: new Types.ObjectId(providerId),
    })
      .sort({ createdAt: -1 })
      .exec()

    return documents.map(toEntity)
  }

  async updateById(
    id: string,
    data: UpdateServiceData,
  ): Promise<Service | null> {
    const document = await ServiceModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    ).exec()

    return document ? toEntity(document) : null
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await ServiceModel.deleteOne({ _id: id }).exec()
    return result.deletedCount === 1
  }
}
