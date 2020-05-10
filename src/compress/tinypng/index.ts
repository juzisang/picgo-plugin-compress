import { CompressOptions, ImgInfo } from '../../utils/interfaces'
import Tinypng from './tinypng'

export function tinypngKeyCompress({ ctx, info, key }: CompressOptions): Promise<ImgInfo> {
  return Tinypng.init({ ctx, keys: key!.split(',') })
    .then(() => Tinypng.upload(info.url))
    .then((buffer) => {
      return {
        ...info,
        buffer,
      }
    })
}
