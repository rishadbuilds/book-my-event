import { Schema, Types, model } from 'mongoose'
import {
  PRICE_UNIT_VALUES,
  PriceUnit,
  SERVICE_CATEGORY_VALUES,
  ServiceCategory,
} from '../../../shared/constants/Service.js'

export interface ServiceContactDocument {
  phone: string
  email?: string
}

export interface ServiceDocument {
  providerId: Types.ObjectId
  name: string
  slug: string
  category: ServiceCategory
  description: string
  images: string[]
  location: string
  price: number
  priceUnit: PriceUnit
  contact: ServiceContactDocument
  allowsMultipleBookings: boolean
  blockedDates: Date[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const contactSchema = new Schema<ServiceContactDocument>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
  },
  { _id: false },
)

const serviceSchema = new Schema<ServiceDocument>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: SERVICE_CATEGORY_VALUES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) => images.length <= 8,
        message: 'A service can have at most 8 images',
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: PRICE_UNIT_VALUES,
      default: PriceUnit.PER_EVENT,
      required: true,
    },
    contact: {
      type: contactSchema,
      required: true,
    },
    allowsMultipleBookings: {
      type: Boolean,
      default: false,
    },
    blockedDates: {
      type: [Date],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Common discovery access patterns: newest-first listings and price sorting
// within a category/location.
serviceSchema.index({ isActive: 1, createdAt: -1 })
serviceSchema.index({ isActive: 1, category: 1, price: 1 })
serviceSchema.index({ isActive: 1, location: 1, price: 1 })

export const ServiceModel = model<ServiceDocument>('Service', serviceSchema)
