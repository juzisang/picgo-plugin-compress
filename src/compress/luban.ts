import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'
var images = require("images");



export function lubanCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  /*function getSample(info: ImgInfo) {
    return ['1x1']
  }*/


function  computeInSampleSize(srcWidth :number, srcHeight:number) {
    srcWidth = srcWidth % 2 == 1 ? srcWidth + 1 : srcWidth;
    srcHeight = srcHeight % 2 == 1 ? srcHeight + 1 : srcHeight;

    var longSide = Math.max(srcWidth, srcHeight);
    var shortSide = Math.min(srcWidth, srcHeight);

    var scale = ( shortSide / longSide);
    if (scale <= 1 && scale > 0.5625) {
      if (longSide < 1664) {
        return 1;
      } else if (longSide < 4990) {
        return 2;
      } else if (longSide > 4990 && longSide < 10240) {
        return 4;
      } else {
        return longSide / 1280 == 0 ? 1 : longSide / 1280;
      }
    } else if (scale <= 0.5625 && scale > 0.5) {
      return longSide / 1280 == 0 ? 1 : longSide / 1280;
    } else {
      return  Math.ceil(longSide / (1280.0 / scale));
    }
  }

  function isJpg(buffer: Buffer) {
    return buffer[0] === 255 &&
      buffer[1] === 216 &&
      buffer[2] === 255
  }

  return getImageBuffer(ctx, info.url)
    .then((buffer)=>{
      if(isJpg(buffer)){
        ctx.log.warn('本身就是jpg,不用转换:'+info.url)
        return buffer
      }
      ctx.log.warn('luban  格式转换为jpg:'+info.url)
      return  images(buffer).encode("jpg", {operation:90})
    })
    .then((buffer)=>{

      var image2 = images(buffer)
      //todo 关键在于获取图片本身的宽高
      var samplesize = computeInSampleSize(image2.width(),image2.height())
      var conpressWidth = image2.width()/samplesize
      ctx.log.warn('luban  width等比压缩:'+image2.width()+"-->"+conpressWidth)
      return  image2.resize(conpressWidth).encode("jpg", {operation:90})
    })
    .then((buffer) => {
      ctx.log.warn('luban  compress in progress')
      //images(buffer).save("/Users/hss/github/picgo-plugin-compressluban/images/"+"xxxx.jpg")
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 70}),optipng({ optimizationLevel: 5 })],//, optipng({ optimizationLevel: 5 })//, sample:sampleSize
      })
    })
    .then((buffer) => {
      ctx.log.warn('luban  compress in success')
      return {
        ...info,
        buffer,
      }
    })
}