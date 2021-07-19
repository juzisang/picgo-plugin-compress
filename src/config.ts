export const TINYPNG_UPLOAD_URL = 'https://api.tinify.com/shrink'

export const TINYPNG_WEBUPLOAD_URL = 'https://tinify.cn/web/shrink'

export enum NameType {
  timestamp = 'timestamp',
  none = 'none',
}

export enum CompressType {
  tinypng = 'tinypng',
  imagemin = 'imagemin',
  imagemin_webp = 'imagemin_webp',
  luban = 'luban',
  lubangitee = 'lubangitee',
}
