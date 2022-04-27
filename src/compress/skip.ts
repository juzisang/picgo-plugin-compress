import PicGo from 'picgo'
import { getImageBuffer, getImageInfo } from '../utils'
import { CommonParams, ImageInfo } from '../interface'

export function SkipCompress(ctx: PicGo, { imageUrl }: CommonParams): Promise<ImageInfo> {
  return getImageBuffer(ctx, imageUrl).then((buffer) => getImageInfo(imageUrl, buffer))
}
