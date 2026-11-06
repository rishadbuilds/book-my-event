import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../application/ports/tokens.js'
import type {
  FileUpload,
  IFileStorage,
  StoredFile,
} from '../../application/ports/services/IFileStorage.js'
import type { Env } from '../config/env.config.js'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
}

/**
 * Local-disk adapter. Files are served from `/uploads` by Express, and the
 * relative URL is stored so deployments can move the files behind a CDN.
 */
@injectable()
export class LocalFileStorage implements IFileStorage {
  constructor(@inject(TOKENS.Config) private readonly config: Env) {}

  async save(file: FileUpload, folder: string): Promise<StoredFile> {
    const safeFolder = /^[a-z0-9-]+$/.test(folder) ? folder : 'misc'
    const extension =
      EXTENSIONS[file.mimeType] ??
      (file.originalName.includes('.')
        ? `.${file.originalName.split('.').pop()!.toLowerCase()}`
        : '')

    const filename = `${randomUUID()}${extension}`
    const targetDir = join(this.config.uploads.dir, safeFolder)

    await mkdir(targetDir, { recursive: true })
    await writeFile(join(targetDir, filename), file.buffer)

    return {
      url: `/uploads/${safeFolder}/${filename}`,
      filename,
      size: file.size,
      mimeType: file.mimeType,
    }
  }
}
