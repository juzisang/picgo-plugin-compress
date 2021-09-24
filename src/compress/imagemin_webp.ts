import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import imageminGif2webp from 'imagemin-gif2webp'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

export function imageminWebPCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  ctx.log.info('imagemin_webp 压缩开始')
  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      return imagemin.buffer(buffer, {
        plugins: [imageminWebp({ quality: 75 }), imageminGif2webp({ quality: 75, lossy: true })],
      })
    })
    .then((buffer) => {
      ctx.log.info('imagemin_webp 压缩完成')
      info.extname = '.webp'
      info.fileName = changeExt(info.fileName, 'webp')
      return {
        ...info,
        buffer,
      }
    })
}

// https://stackoverflow.com/questions/5953239/how-do-i-change-file-extension-with-javascript
function changeExt(fileName: String, newExt: String) {
  var pos = fileName.includes('.') ? fileName.lastIndexOf('.') : fileName.length
  var fileRoot = fileName.substr(0, pos)
  return `${fileRoot}.${newExt}`
}
