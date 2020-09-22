import PicGo from 'picgo'
import { imageSize } from 'image-size'
import * as path from 'path'
import { PluginConfig } from 'picgo/dist/src/utils/interfaces'
import { tinypngCompress } from './compress/tinypngweb'
import { tinypngKeyCompress } from './compress/tinypng/index'
import { imageminCompress } from './compress/imagemin'
import { NameType, CompressType } from './config'
import { reName } from './utils/reName'
import { lubanCompress } from './compress/luban'

//npm install /Users/hss/github/picgo-plugin-compress
function handle(ctx: PicGo) {
  const config = ctx.getConfig('transformer.compress') || ctx.getConfig('picgo-plugin-compress')
  const compress = config?.compress
  const nameType = config?.nameType
  const key = config.key || config.tinypngKey

  const tasks = ctx.input
    .map((imageUrl) => {
      return {
        url: imageUrl,
        fileName: reName(nameType, imageUrl),
        extname: path.extname(imageUrl),
      }
    })
    .map((info) => {
      const options = { ctx, info }
      ctx.log.warn("compress type:" + compress)
      return Promise.resolve()
        .then(() => {
          switch (compress) {
            case CompressType.tinypng:
              return key ? tinypngKeyCompress({ ...options, key }) : tinypngCompress(options)
            case CompressType.imagemin:
              return imageminCompress(options)
            case CompressType.luban:
              return lubanCompress(options)
            default:
              return lubanCompress(options)
          }
        })
        .then((info) => {
          const { width, height } = imageSize(info.buffer as Buffer)
          const { buffer, extname, fileName } = info
          return {
            buffer,
            extname,
            fileName,
            width,
            height,
          }
        })
    })

  return Promise.all(tasks).then((output) => {
    ctx.output = output
    return ctx
  })
}

module.exports = function (ctx: PicGo): any {
  return {
    transformer: 'compress',
    register() {
      ctx.helper.transformer.register('compress', {
        handle,
      })
    },
    config(ctx: PicGo): PluginConfig[] {
      let config = ctx.getConfig('transformer.compress') || ctx.getConfig('picgo-plugin-compress')
      if (!config) {
        config = {}
      }
      return [
        {
          name: 'compress',
          type: 'list',
          message: '选择压缩库',
          choices: Object.keys(CompressType),
          default: config.compress || CompressType.luban,
          required: true,
        },
        {
          name: 'key',
          type: 'input',
          message: '申请key，不填默认使用WebApi，逗号隔开，可使用多个Key叠加使用次数',
          default: config.key || config.tinypngKey || null,
          required: false,
        },
        {
          name: 'nameType',
          type: 'list',
          message: '是否重命名成时间戳',
          choices: Object.keys(NameType),
          default: config.nameType || NameType.none,
          required: false,
        },
      ]
    },
  }
}
