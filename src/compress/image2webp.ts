import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import { CommonParams, ImageInfo } from '../interface'
import { getImageBuffer, getImageInfo } from '../utils'
import PicGo from 'picgo'

export function Image2WebPCompress(ctx: PicGo, { imageUrl }: CommonParams): Promise<ImageInfo> {
  ctx.log.info('Image2WebP 压缩开始')
  return getImageBuffer(ctx, imageUrl)
    .then((buffer) => {
      ctx.log.info('转换图片为WebP')
      return imagemin.buffer(buffer, { plugins: [imageminWebp({ quality: 75 })] })
    })
    .then((buffer) => {
      ctx.log.info('Image2WebP 压缩成功')
      const info = getImageInfo(imageUrl, buffer)
      const extname = '.webp'
      const fileName = info.fileName.replace(info.extname, extname)
      return {
        ...info,
        fileName,
        extname,
      }
    })
}
