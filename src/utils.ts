import * as fs from 'fs-extra'
import PicGo from 'picgo'
import { Response } from 'request'
import { imageSize } from 'image-size'
import { extname, basename } from 'path'
import { ImageInfo } from './interface'

export function isNetworkUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

export async function fetchImage(ctx: PicGo, url: string): Promise<Buffer> {
  return await ctx.Request.request({ method: 'GET', url, encoding: null }).on('response', (response: Response): void => {
    const contentType = response.headers['content-type']
    if (contentType && !contentType.includes('image')) {
      throw new Error(`${url} 不是图片`)
    }
  })
}

export function getImageBuffer(ctx: PicGo, imageUrl: string): Promise<Buffer> {
  if (isNetworkUrl(imageUrl)) {
    ctx.log.info('获取网络图片')
    return fetchImage(ctx, imageUrl)
  } else {
    ctx.log.info('获取本地图片')
    return fs.readFile(imageUrl)
  }
}

export function getImageInfo(imageUrl: string, buffer: Buffer): ImageInfo {
  const { width, height } = imageSize(buffer)
  return {
    buffer,
    width: width as number,
    height: height as number,
    fileName: basename(imageUrl),
    extname: extname(imageUrl),
  }
}

export function getUrlInfo(imageUrl: string) {
  return {
    fileName: basename(imageUrl),
    extname: extname(imageUrl),
  }
}
