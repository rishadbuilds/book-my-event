export interface FileUpload {
  originalName: string
  mimeType: string
  size: number
  buffer: Buffer
}

export interface StoredFile {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface IFileStorage {
  save(file: FileUpload, folder: string): Promise<StoredFile>
}
