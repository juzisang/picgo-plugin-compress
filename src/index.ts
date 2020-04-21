import PicGo from 'picgo'
import { imageSize } from 'image-size'
import * as path from 'path'
import { PluginConfig } from 'picgo/dist/src/utils/interfaces'
import { tinypngCompress } from './compress/tinypng'
import { imageminCompress } from './compress/imagemin'
import { NameType, CompressType } from './utils/enums'
import { getImageBuffer } from './utils/urlUtil'
import { reName } from './utils/nameUtil'

async function handle(ctx: PicGo) {
  const config = ctx.getConfig('transformer.compress')
  const compress = config?.compress
  const nameType = config?.nameType

  const tasks = ctx.input.map((imageUrl) => {
    return getImageBuffer(ctx, imageUrl)
      .then((buffer) => {
        switch (compress) {
          case CompressType.tinypng:
            return tinypngCompress(buffer)
          case CompressType.imagemin:
            return imageminCompress(buffer)
          case CompressType.none:
          default:
            return buffer
        }
      })
      .then((buffer) => {
        const { width, height } = imageSize(buffer)
        return {
          buffer: buffer,
          width: width,
          height: height,
          fileName: reName(nameType, imageUrl),
          extname: path.extname(imageUrl),
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
          default: NameType.timestamp,
          required: true,
        },
      ]
    },
  }
}
