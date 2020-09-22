import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'
import { CompressOptions, ImgInfo } from '../utils/interfaces'
import { getImageBuffer } from '../utils/getImage'

const pngToJpeg = require('png-to-jpeg');

const Png = require("png-js");
const Jpeg = require("jpeg-js");
var images = require("images");

export function lubanCompress({ ctx, info }: CompressOptions): Promise<ImgInfo> {
  function getSample(info: ImgInfo) {
    return ['2,2']
  }
  /*function getWidth(width: Number) {

    if(width < 1080){
      return width
    }
    if(width< 2160){
      return width >> 1
    }
    if(width< 4320){
      return width/4
    }
    return width/6
  }*/

  function isJpg(buffer: Buffer) {
    return buffer[0] === 255 &&
      buffer[1] === 216 &&
      buffer[2] === 255
  }
  var sampleSize = getSample(info);
  console.log("------xxxxx")

  function getWidth(width: number | undefined) {
    if(width == undefined){
      return 700;
    }
    if(width < 1080){
      return width
    }
    if(width< 2160){
      return width /2
    }
    if(width< 4320){
      return width /4
    }
    return width/6
  }

  return getImageBuffer(ctx, info.url)
    .then((buffer)=>{
      if(isJpg(buffer)){
        ctx.log.warn('本身就是jpg,不用转换:'+info.url)
        return buffer
      }
      ctx.log.warn('luban imagemin 格式转换为jpg:'+info.url)
      return  images(buffer).encode("jpg", {operation:70})
    })
    .then((buffer)=>{
      var image = images(buffer)
      var width  = image.width
      var conpressWidth = getWidth(width)
      ctx.log.warn('luban imagemin width等比压缩:'+width+"-->"+conpressWidth)
      return  images(buffer).resize(conpressWidth).encode("jpg", {operation:70})
    })
    /*.then((buffer)=>{
      if(info.url.indexOf('.png') >0){
        ctx.log.warn('luban imagemin pngToJpeg:'+info.url)
        let png = new Png(buffer);
        return new Promise(resolve => png.decode(resolve))
          .then(data => Jpeg.encode({data, width: png.width, height: png.height}, 70).data);
        //return pngToJpeg({quality: 70})(buffer)
      }else {
        return buffer
      }
    })*/
    /*.then((buffer) => {
      ctx.log.warn('luban imagemin compress in progress')
      ctx.log.info("isJpeg:"+isJpg(buffer))
      images(buffer).save("/Users/hss/github/picgo-plugin-compressluban/images/"+"xxxx.jpg")
      return imagemin.buffer(buffer, {
        plugins: [mozjpeg({ quality: 70, progressive: true ,sample:sampleSize}),optipng({ optimizationLevel: 5 })],//, optipng({ optimizationLevel: 5 })
      })
    })*/
    .then((buffer) => {
      ctx.log.warn('luban imagemin compress in success')
      return {
        ...info,
        buffer,
      }
    })
}
