import PicGo from 'picgo'
import { imageSize } from 'image-size'
import * as path from 'path'
import { PluginConfig } from 'picgo/dist/src/utils/interfaces'
import { defaultCompress } from './compress/none'
import { tinypngCompress } from './compress/tinypng'
import { tinypngKeyCompress } from './compress/tinypngkey'
import { imageminCompress } from './compress/imagemin'
import { NameType, CompressType } from './config'
import { reName } from './utils/reName'

function handle(ctx: PicGo) {
  const config = ctx.getConfig('transformer.compress') || ctx.getConfig('picgo-plugin-compress')
  const compress = config?.compress
  const nameType = config?.nameType
  const tinypngKey = config?.tinypngKey

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
      return Promise.resolve()
        .then(() => {
          switch (compress) {
            case CompressType.tinypng:
              return tinypngKey ? tinypngKeyCompress({ ...options, key: tinypngKey }) : tinypngCompress(options)
            case CompressType.imagemin:
              return imageminCompress(options)
            case CompressType.none:
            default:
              return defaultCompress(options)
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
          alias: '压缩库',
          name: 'compress',
          type: 'list',
          message: '选择压缩库',
          choices: Object.keys(CompressType),
          default: config.compress || CompressType.imagemin,
          required: true,
        },
        {
          alias: '重命名',
          name: 'nameType',
          type: 'list',
          message: '是否重命名成时间戳',
          choices: Object.keys(NameType),
          default: config.nameType || NameType.none,
          required: false,
        },
        {
          alias: 'TinypngKey',
          name: 'tinypngKey',
          type: 'input',
          message: '申请key，每月可免费压缩500张图片，不填默认使用WebApi',
          default: config.tinypngKey || null,
          required: false,
        },
      ]
    },
  }
}
