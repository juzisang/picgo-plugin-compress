import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

export function imageminCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 75, progressive: true }), optipng({ optimizationLevel: 5 })],
      })
    })
    .then((buffer) => {
      return {
        ...info,
        buffer,
      }
    })
}
