import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { TINYPNG_WEBUPLOAD_URL } from '../config'
import { Response } from 'request'
import { getImageBuffer } from '../utils/getImage'

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

export function tinypngCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  ctx.log.info('TinyPng Web Upload')
  return getImageBuffer(ctx, info.url).then((buffer) => {
    const req = ctx.Request.request({
      url: TINYPNG_WEBUPLOAD_URL,
      method: 'POST',
      headers: getHeaders(),
      resolveWithFullResponse: true,
    })
    req.end(buffer)
    return req
      .then((data: Response) => {
        if (data.headers.location) {
          ctx.log.info('TinyPng Web Upload Success:' + data.headers.location)
          return getImageBuffer(ctx, data.headers.location)
        }
        throw new Error('TinyPng Web Upload Error')
      })
      .then((buffer) => {
        return {
          ...info,
          buffer,
        }
      })
  })
}
