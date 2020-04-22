import { TINYPNG_UPLOAD_URL } from '../config'
import { getImageBuffer, isUrl } from '../utils/urlUtil'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'

export function tinypngKeyCompress({ ctx, info, key }: CompressOptions): Promise<ImgInfo> {
  return Promise.resolve()
    .then(() => {
      if (isUrl(info.url)) {
        return uploadNetWorkImage({ ctx, info, key })
      }
      return uploadLocalImage({ ctx, info, key })
    })
    .then((buffer) => {
      return {
        ...info,
        buffer,
      }
    })
}

function uploadNetWorkImage({ ctx, info, key }: CompressOptions): Promise<Buffer> {
  const bearer = Base64.stringify(Utf8.parse(`api:${key}`))
  return ctx.Request.request({
    method: 'POST',
    url: TINYPNG_UPLOAD_URL,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      Host: 'api.tinify.com',
      Authorization: `Basic ${bearer}`,
    },
    body: {
      source: {
        url: info.url,
      },
    },
  }).then((data) => {
    if (data.output.url) {
      return getImageBuffer(ctx, data.output.url)
    }
    throw new Error('tinyping upload error')
  })
}

function uploadLocalImage({ ctx, info, key }: CompressOptions): Promise<Buffer> {
  const bearer = Base64.stringify(Utf8.parse(`api:${key}`))
  return getImageBuffer(ctx, info.url).then((buffer) => {
    const req = ctx.Request.request({
      method: 'POST',
      url: TINYPNG_UPLOAD_URL,
      json: true,
      headers: {
        Authorization: `Basic ${bearer}`,
        Host: 'api.tinify.com',
      },
    })
    req.end(buffer)
    return req.then((data) => {
      if (data.output.url) {
        return getImageBuffer(ctx, data.output.url)
      }
      throw new Error('tinyping upload error')
    })
  })
}
