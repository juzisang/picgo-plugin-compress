import PicGo from 'picgo'

export interface ImgInfo {
  url: string
  fileName: string
  extname: string
  buffer?: Buffer
  width?: number
  height?: number
}

export interface CompressOptions {
  ctx: PicGo
  info: ImgInfo
  key?: string
}
