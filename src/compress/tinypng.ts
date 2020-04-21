import { ICompress } from '../utils/interfaces'

export class TinyPngCompress implements ICompress {
  compressImg(file: string | Buffer): Promise<Buffer> {
    return Promise.resolve(file as Buffer)
  }
}
