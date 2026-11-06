import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { TOKENS } from '../../application/ports/tokens.js'
import type { IFileStorage } from '../../application/ports/services/IFileStorage.js'
import { ValidationError } from '../../domain/errors/AppError.js'
import { sendData } from '../utils/response.js'

@injectable()
export class UploadController {
  constructor(
    @inject(TOKENS.FileStorage) private readonly storage: IFileStorage,
  ) {}

  uploadImages = async (req: Request, res: Response): Promise<void> => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []

    if (files.length === 0) {
      throw new ValidationError('Select at least one image to upload')
    }

    const images = await Promise.all(
      files.map((file) =>
        this.storage.save(
          {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer,
          },
          'services',
        ),
      ),
    )

    sendData(res, { images }, 201)
  }
}
