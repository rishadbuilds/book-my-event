import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { CreateBooking } from '../../application/usecases/bookings/CreateBooking.js'
import { ListBookings } from '../../application/usecases/bookings/ListBookings.js'
import { ListProviderBookings } from '../../application/usecases/bookings/ListProviderBookings.js'
import { GetBooking } from '../../application/usecases/bookings/GetBooking.js'
import { UpdateBookingStatus } from '../../application/usecases/bookings/UpdateBookingStatus.js'
import type {
  CreateBookingDto,
  ListBookingsQueryDto,
  ListProviderBookingsQueryDto,
  UpdateBookingStatusDto,
} from '../../application/dtos/booking.dto.js'
import type { Actor } from '../../application/types/Actor.js'
import { UserRole } from '../../shared/constants/Roles.js'
import { sendData } from '../utils/response.js'

@injectable()
export class BookingController {
  constructor(
    @inject(CreateBooking) private readonly createBooking: CreateBooking,
    @inject(ListBookings) private readonly listBookings: ListBookings,
    @inject(ListProviderBookings)
    private readonly listProviderBookings: ListProviderBookings,
    @inject(GetBooking) private readonly getBooking: GetBooking,
    @inject(UpdateBookingStatus)
    private readonly updateBookingStatus: UpdateBookingStatus,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const booking = await this.createBooking.execute(
      req.body as CreateBookingDto,
      this.actor(req),
    )
    sendData(res, booking, 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const query = res.locals.validatedQuery as ListBookingsQueryDto
    const result = await this.listBookings.execute(this.actor(req), query)
    sendData(res, result.items, 200, result.meta)
  }

  providerList = async (req: Request, res: Response): Promise<void> => {
    const query = res.locals
      .validatedQuery as ListProviderBookingsQueryDto
    const result = await this.listProviderBookings.execute(
      this.actor(req),
      query,
    )
    sendData(res, result.items, 200, result.meta)
  }

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.validatedParams as { id: string }
    const booking = await this.getBooking.execute(id, this.actor(req))
    sendData(res, booking, 200)
  }

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.validatedParams as { id: string }
    const booking = await this.updateBookingStatus.execute(
      id,
      req.body as UpdateBookingStatusDto,
      this.actor(req),
    )
    sendData(res, booking, 200)
  }

  private actor(req: Request): Actor {
    return {
      userId: req.auth!.sub,
      role: req.auth!.role as UserRole,
    }
  }
}
