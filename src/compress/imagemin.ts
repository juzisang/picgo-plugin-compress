import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import upng from 'imagemin-upng'
import PicGo from 'picgo'
import { CommonParams, ImageInfo } from '../interface'
import { getImageBuffer, getImageInfo } from '../utils'

export function ImageminCompress(ctx: PicGo, { imageUrl }: CommonParams): Promise<ImageInfo> {
  ctx.log.info('imagemin 压缩开始')
  return getImageBuffer(ctx, imageUrl)
    .then((buffer) => imagemin.buffer(buffer, { plugins: [mozjpeg({ quality: 75, progressive: true }), upng()] }))
    .then((buffer) => {
      ctx.log.info('imagemin 压缩完成')
      return getImageInfo(imageUrl, buffer)
    })
}
