import PicGo from 'picgo'
import { CommonParams, ImageInfo } from '../interface'
import { TINYPNG_WEBUPLOAD_URL } from '../config'
import { Response } from 'request'
import { getImageBuffer, getImageInfo } from '../utils'

function getHeaders() {
  const v = 59 + Math.round(Math.random() * 10)
  const v2 = Math.round(Math.random() * 100)
  return {
    origin: TINYPNG_WEBUPLOAD_URL,
    referer: TINYPNG_WEBUPLOAD_URL,
    'content-type': 'application/x-www-form-urlencoded',
    'user-agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.4044.${v2} Safari/537.36`,
  }
}

export function TinypngCompress(ctx: PicGo, { imageUrl }: CommonParams): Promise<ImageInfo> {
  return getImageBuffer(ctx, imageUrl).then((buffer) => {
    ctx.log.info('TinypngWeb 压缩开始')
    const req = ctx.Request.request({ url: TINYPNG_WEBUPLOAD_URL, method: 'POST', headers: getHeaders(), resolveWithFullResponse: true })
    req.end(buffer)
    return req
      .then((data: Response) => {
        if (data.headers.location) {
          ctx.log.info('TinypngWeb 压缩成功:' + data.headers.location)
          ctx.log.info('下载 Tinypng 图片')
          return getImageBuffer(ctx, data.headers.location)
        }
        throw new Error('TinypngWeb 上传失败')
      })
      .then((buffer) => {
        return getImageInfo(imageUrl, buffer)
      })
  })
}
