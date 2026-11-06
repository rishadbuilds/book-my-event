import { injectable } from 'tsyringe'
import { Types, type HydratedDocument } from 'mongoose'
import type {
  CreateServiceData,
  IServiceRepository,
  UpdateServiceData,
} from '../../../application/ports/repositories/IServiceRepository.js'
import type { Service } from '../../../domain/entities/Service.js'
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
