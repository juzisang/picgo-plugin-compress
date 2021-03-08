import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

export function imageminWebPCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  ctx.log.info('imagemin 压缩开始')
  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      return imagemin.buffer(buffer, {
        plugins: [imageminWebp({ quality: 75 })],
      })
    })
    .then((buffer) => {
      ctx.log.info('imagemin 压缩完成')
      return {
        ...info,
        buffer,
      }
    })
}
