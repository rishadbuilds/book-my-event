import { Schema, Types, model } from 'mongoose'
import {
  BOOKING_STATUS_VALUES,
  BookingStatus,
} from '../../../shared/constants/Booking.js'
import {
  PRICE_UNIT_VALUES,
  PriceUnit,
} from '../../../shared/constants/Service.js'

export interface BookingDocument {
  userId: Types.ObjectId
  providerId: Types.ObjectId
  serviceId: Types.ObjectId
  serviceName: string
  serviceLocation: string
  serviceImage?: string
  unitPrice: number
  priceUnit: PriceUnit
  totalPrice: number
  guestCount: number
  eventDate: Date
  status: BookingStatus
  notes?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    // Snapshots keep booking history readable even if the service changes.
    serviceName: { type: String, required: true, trim: true },
    serviceLocation: { type: String, required: true, trim: true },
    serviceImage: { type: String, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    priceUnit: {
      type: String,
      enum: PRICE_UNIT_VALUES,
      required: true,
    },
    totalPrice: { type: Number, required: true, min: 0 },
    guestCount: { type: Number, required: true, min: 1 },
    eventDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      default: BookingStatus.PENDING,
      required: true,
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Only exclusive bookings set isActive. Multiple-booking services always
// create isActive: false rows, so they never collide in this partial index.
bookingSchema.index(
  { serviceId: 1, eventDate: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
)
bookingSchema.index({ userId: 1, createdAt: -1 })
bookingSchema.index({ providerId: 1, createdAt: -1 })
bookingSchema.index({ serviceId: 1, eventDate: 1, status: 1 })

export const BookingModel = model<BookingDocument>('Booking', bookingSchema)
