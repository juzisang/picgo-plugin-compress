import imagemin, { buffer } from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'
import imageminGifsicle from 'imagemin-gifsicle'

var images = require('images')
const isGif = require('is-gif')
// this will grant 755 permission to webp executables

/*const isPng = require('is-png')
const isWebp = require('is-webp')*/
const thehold = 1023
const jpgQuality = 75
const gifcolors = 32

//由于gitee文件大小有1mb限制, 所以超过1mb的文件无法通过外链获取,通过这个工具将图压到1M以下

export function lubanforgiteeCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  var originalSize = 0

  function computeInSampleSize(srcWidth: number, srcHeight: number) {
    srcWidth = srcWidth % 2 == 1 ? srcWidth + 1 : srcWidth
    srcHeight = srcHeight % 2 == 1 ? srcHeight + 1 : srcHeight

    var longSide = Math.max(srcWidth, srcHeight)
    var shortSide = Math.min(srcWidth, srcHeight)

    var scale = shortSide / longSide
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
    return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
  }

  function isWebp(buf: Buffer) {
    if (!buf || buf.length < 12) {
      return false
    }

    return buf[8] === 87 && buf[9] === 69 && buf[10] === 66 && buf[11] === 80
  }

  function isPng(buffer: Buffer) {
    if (!buffer || buffer.length < 8) {
      return false
    }

    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    )
  }

  function compressJpg(buffer: Buffer, quality: number): Promise<Buffer> {
    if (Math.round(buffer.length / 1024) < thehold) {
      return Promise.resolve(buffer)
    }
    //return Promise.resolve(buffer)
    ctx.log.warn('文件大小:' + Math.round(buffer.length / 1024) + 'k')

    var image2 = images(buffer)
    ctx.log.warn('图片尺寸:' + image2.width() + 'x' + image2.height())
    var sample = Math.round(computeInSampleSize(image2.width(), image2.height()))
    var filesize = Math.round(buffer.length / 1024)
    var longsize = image2.width() > image2.height() ? image2.width() : image2.height()
    var sampleSize = ['1x1']
    if (filesize > 100 && sample > 1) {
      if (longsize > 3000 && filesize < 700) {
      } else {
        sampleSize = [sample + 'x' + 1]
      }
    }
    ctx.log.warn('sampleSize:' + sampleSize[0] + ',质量' + quality)
    if (quality < 40) {
      ctx.log.warn(sample + '倍缩小图片尺寸为:' + image2.width() / sample + 'x' + image2.height() / sample)
      //resize
      buffer = images(buffer)
        .resize(image2.width() / sample, image2.height() / sample)
        .encode('.jpg')
      quality = 50
    }

    return imagemin
      .buffer(buffer, {
        plugins: [mozjpeg({ quality: quality, sample: sampleSize })], //, optipng({ optimizationLevel: 5 })//, sample:sampleSize
      })
      .then((buffer2) => {
        if (Math.round(buffer2.length / 1024) < thehold) {
          return Promise.resolve(buffer2)
        }
        return compressJpg(buffer2, quality - 20) //递归
      })
  }

  function compressPng(buffer: Buffer): Promise<Buffer> {
    //todo 先判断有没有透明通道
    ctx.log.warn('luban  格式转换为jpg')
    var buffer1: Buffer = images(buffer).encode('jpg')
    return compressJpg(buffer1, jpgQuality)
  }

  function compressWebP(buffer: Buffer): Promise<Buffer> {
    //todo 先判断有没有透明通道
    ctx.log.warn('webp  格式转换为jpg')
    /*return imagemin
      .buffer(buffer, {
        plugins: [mozjpeg({ quality: 70, sample: ['1x1'] })] //, optipng({ optimizationLevel: 5 })//, sample:sampleSize
      })*/
    return Promise.resolve(buffer)
  }

  // gif图的递归压缩算法
  function compressGif(buffer: Buffer, colors: number): Promise<Buffer> {
    if (Math.round(buffer.length / 1024) < thehold) {
      return Promise.resolve(buffer)
    }
    ctx.log.warn('gif图执行压缩:colors' + colors)
    if (colors < 8) {
      var buffer1: Buffer = images(buffer).encode('jpg')
      ctx.log.warn('luban  gif格式转换为jpg')
      return compressJpg(buffer1, jpgQuality)
    }

    return imagemin
      .buffer(buffer, {
        plugins: [imageminGifsicle({ colors: colors, optimizationLevel: 3 })], //, optipng({ optimizationLevel: 5 })//, sample:sampleSize
      })
      .then((buffer2) => {
        if (Math.round(buffer2.length / 1024) < thehold) {
          return Promise.resolve(buffer2)
        }
        return compressGif(buffer2, colors / 2) //递归
      })
  }

  return getImageBuffer(ctx, info.url)
    .then((buffer) => {
      originalSize = buffer.length
      ctx.log.warn('原始文件大小:' + Math.round(buffer.length / 1024) + 'k ,' + info.url)
      if (isJpg(buffer)) {
        ctx.log.warn('本身就是jpg,不用转换:' + info.url)
        return compressJpg(buffer, jpgQuality)
      } else if (isPng(buffer)) {
        ctx.log.warn('isPng,转换成jpg:' + info.url)
        return compressPng(buffer)
      } else if (isGif(buffer)) {
        return compressGif(buffer, gifcolors)
      } else if (isWebp(buffer)) {
        return compressWebP(buffer)
      } else {
        ctx.log.warn('其他类型图片,转换成jpg:')
        return compressPng(buffer)
      }
    })
    .then((buffer) => {
      //最终第二道检查
      if (Math.round(buffer.length / 1024) < thehold) {
        //压缩后比压缩前还大,就用压缩前的
        if (buffer.length > originalSize) {
          ctx.log.warn('压缩后比压缩前还大,就用压缩前的原图')
          return getImageBuffer(ctx, info.url)
        }
        return buffer
      }
      if (isGif(buffer)) {
        //gif图,大于1M,
        ctx.log.warn('gif图压了两边都没有压到1M以下,不搞了,直接转换为jpg')
        return imagemin.buffer(images(buffer).encode('jpg'), {
          plugins: [mozjpeg({ quality: 75, sample: ['1x1'] })],
        })
      }
      ctx.log.warn(Math.round(buffer.length / 1024) + 'k,大于1M,继续压,sampleSize:1x2,质量60')
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 60, sample: ['1x2'] })],
      })
    })
    .then((buffer) => {
      ctx.log.warn('最后compress in success,最终文件大小:' + Math.round(buffer.length / 1024) + 'k')
      return {
        ...info,
        buffer,
      }
    })
}
