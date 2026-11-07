import { injectable } from 'tsyringe'
import { Types, type HydratedDocument } from 'mongoose'
import type {
  BookingFilters,
  BookingPage,
  CreateBookingData,
  IBookingRepository,
} from '../../../application/ports/repositories/IBookingRepository.js'
import type { Booking } from '../../../domain/entities/Booking.js'
import { ConflictError } from '../../../domain/errors/AppError.js'
import type { BookingStatus } from '../../../shared/constants/Booking.js'
import { endOfUtcDay, startOfUtcDay } from '../../../shared/utils/date.js'
import { BookingModel, type BookingDocument } from '../models/BookingModel.js'

function toEntity(document: HydratedDocument<BookingDocument>): Booking {
  return {
    id: document.id,
    userId: document.userId.toString(),
    providerId: document.providerId.toString(),
    serviceId: document.serviceId.toString(),
    serviceName: document.serviceName,
    serviceLocation: document.serviceLocation,
    serviceImage: document.serviceImage,
    unitPrice: document.unitPrice,
    priceUnit: document.priceUnit,
    totalPrice: document.totalPrice,
    guestCount: document.guestCount,
    eventDate: document.eventDate,
    status: document.status,
    notes: document.notes,
    customerName: document.customerName,
    customerEmail: document.customerEmail,
    customerPhone: document.customerPhone,
    isActive: document.isActive,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  )
}

@injectable()
export class MongoBookingRepository implements IBookingRepository {
  async create(data: CreateBookingData): Promise<Booking> {
    try {
      const document = await BookingModel.create({
        ...data,
        userId: new Types.ObjectId(data.userId),
        providerId: new Types.ObjectId(data.providerId),
        serviceId: new Types.ObjectId(data.serviceId),
      })

      return toEntity(document)
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError(
          'This service is already booked for the selected date',
        )
      }

      throw error
    }
  }

  async findById(id: string): Promise<Booking | null> {
    const document = await BookingModel.findById(id).exec()
    return document ? toEntity(document) : null
  }

  async findMany(filters: BookingFilters): Promise<BookingPage> {
    const query: {
      userId?: Types.ObjectId
      providerId?: Types.ObjectId
      serviceId?: Types.ObjectId
      status?: BookingStatus
      eventDate?: { $gte: Date; $lt: Date }
    } = {}

    if (filters.userId) query.userId = new Types.ObjectId(filters.userId)
    if (filters.providerId) {
      query.providerId = new Types.ObjectId(filters.providerId)
    }
    if (filters.serviceId) {
      query.serviceId = new Types.ObjectId(filters.serviceId)
    }
    if (filters.status) query.status = filters.status

    if (filters.date) {
      query.eventDate = {
        $gte: startOfUtcDay(filters.date),
        $lt: endOfUtcDay(filters.date),
      }
    }

    const skip = (filters.page - 1) * filters.limit

    const [documents, total] = await Promise.all([
      BookingModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      BookingModel.countDocuments(query).exec(),
    ])

    return { items: documents.map(toEntity), total }
  }

  async findUnavailableServiceIds(eventDate: Date): Promise<string[]> {
    const ids = await BookingModel.distinct('serviceId', {
      eventDate: {
        $gte: startOfUtcDay(eventDate),
        $lt: endOfUtcDay(eventDate),
      },
      isActive: true,
    }).exec()

    return ids.map((id) => id.toString())
  }

  async transition(
    id: string,
    fromStatus: BookingStatus,
    status: BookingStatus,
    isActive: boolean,
  ): Promise<Booking | null> {
    const document = await BookingModel.findOneAndUpdate(
      { _id: id, status: fromStatus },
      { $set: { status, isActive } },
      { returnDocument: 'after', runValidators: true },
    ).exec()

    return document ? toEntity(document) : null
  }
}
