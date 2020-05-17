export const TINYPNG_UPLOAD_URL = 'https://api.tinify.com/shrink'

export const TINYPNG_WEBUPLOAD_URL = 'https://tinify.cn/web/shrink'

export enum NameType {
  timestamp = 'timestamp',
  none = 'none',
}

export enum CompressType {
  tinypng = 'tinypng',
  imagemin = 'imagemin',
  upng = 'upng',
  none = 'none',
}
