import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

var images = require('images')
const isGif = require('is-gif')

//由于gitee文件大小有1mb限制, 所以超过1mb的文件无法通过外链获取,通过这个工具将图压到1M以下

export function lubanforgiteeCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  /*function getSample(info: ImgInfo) {
    return ['1x1']
  }*/


  function computeInSampleSize(srcWidth: number, srcHeight: number) {
    srcWidth = srcWidth % 2 == 1 ? srcWidth + 1 : srcWidth
    srcHeight = srcHeight % 2 == 1 ? srcHeight + 1 : srcHeight

    var longSide = Math.max(srcWidth, srcHeight)
    var shortSide = Math.min(srcWidth, srcHeight)

    var scale = (shortSide / longSide)
    if (scale <= 1 && scale > 0.5625) {
      if (longSide < 1664) {
        return 1
      } else if (longSide < 4990) {
        return 2
      } else if (longSide > 4990 && longSide < 10240) {
        return 4
      } else {
        return longSide / 1280 == 0 ? 1 : longSide / 1280
      }
    } else if (scale <= 0.5625 && scale > 0.5) {
      return longSide / 1280 == 0 ? 1 : longSide / 1280
    } else {
      return Math.ceil(longSide / (1280.0 / scale))
    }
  }

  function isJpg(buffer: Buffer) {
    return buffer[0] === 255 &&
      buffer[1] === 216 &&
      buffer[2] === 255
  }

  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      ctx.log.warn('原始文件大小:' + Math.round(buffer.length / 1024) + 'k')
      if (isJpg(buffer)) {
        ctx.log.warn('本身就是jpg,不用转换:' + info.url)
        return buffer
      }
      if (isGif(buffer) && Math.round(buffer.length / 1024) < 1024) {
        //大于1M的gif,强制压缩成jpg
        return buffer
      }
      ctx.log.warn('luban  格式转换为jpg:' + info.url)
      return images(buffer).encode('jpg')//, {operation:90}
    })
    .then((buffer) => {
      ctx.log.warn('文件大小:' + Math.round(buffer.length / 1024) + 'k')

      var image2 = images(buffer)
      ctx.log.warn('图片尺寸:' + image2.width() + 'x' + image2.height())
      if (isGif(buffer)) {
        ctx.log.info('gif图,不压缩')
        return buffer
      }
      //todo 关键在于获取图片本身的宽高
      var sample = Math.round(computeInSampleSize(image2.width(), image2.height()))
      var filesize = Math.round(buffer.length / 1024)
      var longsize = image2.width() > image2.height() ? image2.width() : image2.height()
      var sampleSize = ['1x1']
      if (filesize > 100 && sample > 1) {
        if (longsize > 3000 && filesize < 700) {

        } else {
          sampleSize = [sample + 'x' + sample]
        }
      }
      ctx.log.warn('sampleSize:' + sampleSize[0] + ',质量75')

      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 75, sample: sampleSize })]//, optipng({ optimizationLevel: 5 })//, sample:sampleSize
      })
    })
    .then((buffer) => {
      //最终第一道检查
      if (Math.round(buffer.length / 1024) < 1024) {
        return buffer
      }
      ctx.log.warn(Math.round(buffer.length / 1024) + 'k,大于1M,继续压,sampleSize:2x1,质量65')
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 65, sample: ['2x1'] })]
      })
    })
    .then((buffer) => {
      //最终第二道检查
      if (Math.round(buffer.length / 1024) < 1024) {
        return buffer
      }
      ctx.log.warn(Math.round(buffer.length / 1024) + 'k,大于1M,继续压,sampleSize:1x2,质量60')
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 60, sample: ['1x2'] })]
      })
    })
    .then((buffer) => {
      ctx.log.warn('最后mozjpeg  compress in success,最终文件大小:' + Math.round(buffer.length / 1024) + 'k')
      return {
        ...info,
        buffer
      }
    })
}
