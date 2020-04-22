import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/urlUtil'

export function defaultCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  return getImageBuffer(ctx, info.url).then((buffer) => {
    return {
      ...info,
      buffer,
    }
  })
}
