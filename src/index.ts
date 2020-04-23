import PicGo from 'picgo'
import { imageSize } from 'image-size'
import * as path from 'path'
import { PluginConfig } from 'picgo/dist/src/utils/interfaces'
import { defaultCompress } from './compress/default'
import { tinypngCompress } from './compress/tinypng'
import { tinypngKeyCompress } from './compress/tinypngkey'
import { imageminCompress } from './compress/imagemin'
import { NameType, CompressType } from './utils/enums'
import { reName } from './utils/nameUtil'

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
          return {
            ...info,
            ...imageSize(info.buffer as Buffer),
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
          name: 'compress',
          type: 'list',
          choice: Object.keys(CompressType),
          default: CompressType.imagemin,
          required: true,
        },
        {
          name: 'nameType',
          type: 'list',
          choice: Object.keys(NameType),
          default: NameType.none,
          required: true,
        },
        {
          name: 'tinypngKey',
          type: 'input',
          required: false,
        },
      ]
    },
  }
}
