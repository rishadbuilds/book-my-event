import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { ListServices } from '../../application/usecases/services/ListServices.js'
import { ListProviderServices } from '../../application/usecases/services/ListProviderServices.js'
import { GetServiceBySlug } from '../../application/usecases/services/GetServiceBySlug.js'
import { GetProviderService } from '../../application/usecases/services/GetProviderService.js'
import { GetServiceMeta } from '../../application/usecases/services/GetServiceMeta.js'
import { CreateService } from '../../application/usecases/services/CreateService.js'
import { UpdateService } from '../../application/usecases/services/UpdateService.js'
import { DeleteService } from '../../application/usecases/services/DeleteService.js'
import type {
  CreateServiceDto,
  ListProviderServicesQueryDto,
  ListServicesQueryDto,
  UpdateServiceDto,
} from '../../application/dtos/service.dto.js'
import type { Actor } from '../../application/types/Actor.js'
import { UserRole } from '../../shared/constants/Roles.js'
import { sendData } from '../utils/response.js'

@injectable()
export class ServiceController {
  constructor(
    @inject(ListServices) private readonly listServices: ListServices,
    @inject(ListProviderServices)
    private readonly listProviderServices: ListProviderServices,
    @inject(GetServiceBySlug)
    private readonly getServiceBySlug: GetServiceBySlug,
    @inject(GetProviderService)
    private readonly getProviderServiceUseCase: GetProviderService,
    @inject(GetServiceMeta)
    private readonly getServiceMeta: GetServiceMeta,
    @inject(CreateService) private readonly createService: CreateService,
    @inject(UpdateService) private readonly updateService: UpdateService,
    @inject(DeleteService) private readonly deleteService: DeleteService,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.validatedQuery as ListServicesQueryDto
    const result = await this.listServices.execute(query)
    sendData(res, result.items, 200, result.meta)
  }

  providerList = async (req: Request, res: Response): Promise<void> => {
    const query = res.locals.validatedQuery as ListProviderServicesQueryDto
    const result = await this.listProviderServices.execute(
      this.actor(req),
      query,
    )
    sendData(res, result.items, 200, result.meta)
  }

  meta = async (_req: Request, res: Response): Promise<void> => {
    const meta = await this.getServiceMeta.execute()
    sendData(res, meta, 200)
  }

  getBySlug = async (_req: Request, res: Response): Promise<void> => {
    const { slug } = res.locals.validatedParams as { slug: string }
    const service = await this.getServiceBySlug.execute(slug)
    sendData(res, service, 200)
  }

  getProviderService = async (req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.validatedParams as { id: string }
    const service = await this.getProviderServiceUseCase.execute(id, this.actor(req))
    sendData(res, service, 200)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const service = await this.createService.execute(
      req.body as CreateServiceDto,
      this.actor(req),
    )
    sendData(res, service, 201)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.validatedParams as { id: string }
    const service = await this.updateService.execute(
      id,
      req.body as UpdateServiceDto,
      this.actor(req),
    )
    sendData(res, service, 200)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.validatedParams as { id: string }
    await this.deleteService.execute(id, this.actor(req))
    sendData(res, { message: 'Service removed from listings' }, 200)
  }

  private actor(req: Request): Actor {
    return {
      userId: req.auth!.sub,
      role: req.auth!.role as UserRole,
    }
  }
}
