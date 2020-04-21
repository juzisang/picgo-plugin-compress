import { ICompress } from '../utils/interfaces'

export class ImageMinCompress implements ICompress {
  compressImg(file: string): Promise<Buffer> {
    throw new Error('Method not implemented.')
  }
}
