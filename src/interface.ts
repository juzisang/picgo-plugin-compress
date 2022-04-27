export interface ImageInfo {
  fileName: string
  extname: string
  buffer: Buffer
  width: number
  height: number
}

export interface CommonParams {
  imageUrl: string
}

export interface IConfig {
  compress: string
  key: string
  tinypngKey: string
  nameType: string
}
