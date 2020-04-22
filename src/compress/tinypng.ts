import { CompressOptions, ImgInfo } from '../utils/interfaces'

function getHeaders() {
  return {
    origin: 'https://tinypng.com',
    referer: 'https://tinypng.com/',
    'content-type': 'application/x-www-form-urlencoded',
    'user-agent': '',
  }
}

export function tinypngCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  throw new Error('not work')
}
