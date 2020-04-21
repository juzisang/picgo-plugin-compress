import * as fs from 'fs-extra'
import PicGo from 'picgo'
import { Response } from 'request'

export function isUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

export async function fetch(ctx: PicGo, url: string): Promise<Buffer> {
  return await ctx.Request.request({ method: 'Get', url, encoding: null }).on('response', (response: Response): void => {
    const contentType = response.headers['content-type']
    if (contentType && !contentType.includes('image')) {
      throw new Error(`${url} is not image`)
    }
  })
}

export function getImageBuffer(ctx: PicGo, imageUrl: string): Promise<Buffer> {
  if (isUrl(imageUrl)) {
    return fetch(ctx, imageUrl)
  } else {
    return fs.readFile(imageUrl)
  }
}
