import type { Booking } from '../../domain/entities/Booking.js'
import {
  ConflictError,
  ForbiddenError,
} from '../../domain/errors/AppError.js'
import { BookingStatus, BOOKING_TRANSITIONS } from '../../shared/constants/Booking.js'
import { UserRole } from '../../shared/constants/Roles.js'
import type { Actor } from '../types/Actor.js'

export function assertCanViewBooking(booking: Booking, actor: Actor): void {
  if (actor.role === UserRole.ADMIN) return
  if (booking.userId === actor.userId) return
  if (
    actor.role === UserRole.PROVIDER &&
    booking.providerId === actor.userId
  ) {
    return
  }

  throw new ForbiddenError('You do not have access to this booking')
}

/**
 * Enforces the lifecycle state machine and the caller's role. Customers may
 * only cancel their own bookings; service providers manage their bookings;
 * admins may apply any valid transition.
 */
export function assertCanChangeBookingStatus(
  booking: Booking,
  nextStatus: BookingStatus,
  actor: Actor,
): void {
  assertCanViewBooking(booking, actor)

  if (!BOOKING_TRANSITIONS[booking.status].includes(nextStatus)) {
    throw new ConflictError(
      `A ${booking.status} booking cannot be changed to ${nextStatus}`,
    )
  }

  if (actor.role === UserRole.ADMIN) return

  if (
    actor.role === UserRole.PROVIDER &&
    booking.providerId === actor.userId
  ) {
    return
  }

  if (
    booking.userId === actor.userId &&
    nextStatus === BookingStatus.CANCELLED
  ) {
    return
  }

  throw new ForbiddenError('You cannot update this booking status')
}
