import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import upng from 'imagemin-upng'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

export function imageminCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  ctx.log.info('imagemin 压缩开始')
  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 75, progressive: true }), upng()],
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
