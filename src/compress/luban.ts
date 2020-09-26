import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

var images = require('images')
const isGif = require('is-gif')

//由于gitee文件大小有1mb限制, 所以超过1mb的文件无法通过外链获取

export function lubanCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  /*function getSample(info: ImgInfo) {
    return ['1x1']
  }*/

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

  return (
    getImageBuffer(ctx, info.url)
      .then((buffer) => {
        ctx.log.warn('原始文件大小:' + Math.round(buffer.length / 1024) + 'k')
        if (isJpg(buffer)) {
          ctx.log.warn('本身就是jpg,不用转换:' + info.url)
          return buffer
        }
        if (isGif(buffer)) {
          return buffer
        }
        ctx.log.warn('luban  格式转换为jpg:' + info.url)
        return images(buffer).encode('jpg') //, {operation:90}
      })
      /*.then((buffer)=>{
      var image2 = images(buffer)
      ctx.log.warn('图片尺寸:'+image2.width()+"x"+image2.height())
      //todo 关键在于获取图片本身的宽高
      var samplesize = computeInSampleSize(image2.width(),image2.height())
      if(samplesize <=1){
        return buffer
      }
      var size2 = Math.round(buffer.length/1024)
      if(size2 <150){
        //150k以下,不压缩
        return buffer
      }
      var longsize = image2.width() > image2.height() ? image2.width() :image2.height()
      //长边大于2500,且文件大小小于1024k,就不压缩
      if(size2 < 1024 && longsize> 2500){
        return buffer
      }
      var conpressWidth = image2.width()/samplesize
      ctx.log.warn('转换成jpg后文件大小:'+Math.round(buffer.length/1024)+"k")
      ctx.log.warn('准备用luban算法压缩:宽度变化:'+image2.width()+"-->"+conpressWidth)

      return  image2.resize(conpressWidth).encode("jpg")//, {operation:90}
    })*/
      .then((buffer) => {
        ctx.log.warn('文件大小:' + Math.round(buffer.length / 1024) + 'k')

        var image2 = images(buffer)
        ctx.log.warn('图片尺寸:' + image2.width() + 'x' + image2.height())
        if (isGif(buffer)) {
          ctx.log.warn('gif图,不压缩')
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
        ctx.log.warn('sampleSize:' + sampleSize[0])

        return imagemin.buffer(buffer, {
          plugins: [mozjpeg({ quality: 75, sample: sampleSize })], //, optipng({ optimizationLevel: 5 })//, sample:sampleSize
        })
      })
      .then((buffer) => {
        ctx.log.warn('最后mozjpeg  compress in success,最终文件大小:' + Math.round(buffer.length / 1024) + 'k')
        return {
          ...info,
          buffer,
        }
      })
  )
}
