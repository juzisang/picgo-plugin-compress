import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import imageminUpng from 'imagemin-upng'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

export function upngCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      ctx.log.info('upng compress in progress')
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 75, progressive: true }), imageminUpng()],
      })
    })
    .then((buffer) => {
      ctx.log.info('upng compress in success')
      return {
        ...info,
        buffer,
      }
    })
}
