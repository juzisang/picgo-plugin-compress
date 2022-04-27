import PicGo from 'picgo'
import { getImageInfo } from '../../utils'
import { CommonParams, ImageInfo } from '../../interface'
import Tinypng from './tinypng'

export interface ITinypngOptions {
  key: string
}

export function TinypngKeyCompress(ctx: PicGo, { imageUrl, key }: CommonParams & ITinypngOptions): Promise<ImageInfo> {
  return Tinypng.init({ ctx, keys: key!.split(',') })
    .then(() => Tinypng.upload(imageUrl))
    .then((buffer) => {
      ctx.log.info('Tinypng 上传成功')
      return getImageInfo(imageUrl, buffer)
    })
}
