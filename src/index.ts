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

async function handle(ctx: PicGo) {
  const config = ctx.getConfig('transformer.compress')
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

  ctx.output = await Promise.all(tasks)

  return ctx
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
      return [
        {
          alias: '压缩选项',
          name: 'compress',
          type: 'list',
          choices: Object.keys(CompressType),
          default: CompressType.imagemin,
          required: true,
        },
        {
          alias: '重命名选项',
          name: 'nameType',
          type: 'list',
          choices: Object.keys(NameType),
          default: NameType.none,
          required: false,
        },
        {
          alias: 'TinypngKey',
          name: 'tinypngKey',
          type: 'input',
          required: false,
        },
      ]
    },
  }
}
