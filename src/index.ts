import PicGo from 'picgo'
import { PluginConfig } from 'picgo/dist/src/utils/interfaces'
import { TinypngCompress } from './compress/tinypngweb'
import { TinypngKeyCompress } from './compress/tinypng/index'
import { ImageminCompress } from './compress/imagemin'
import { Image2WebPCompress } from './compress/image2webp'
import { CompressType } from './config'
import { getUrlInfo } from './utils'
import { IConfig } from './interface'
import { SkipCompress } from './compress/skip'

const ALLOW_EXTNAME = ['.png', '.jpg', '.webp', '.jpeg']

function handle(ctx: PicGo) {
  const config: IConfig = ctx.getConfig('transformer.compress') || ctx.getConfig('picgo-plugin-compress')
  const compress = config?.compress
  const key = config?.key || config?.tinypngKey

  ctx.log.info('压缩:' + compress)

  const tasks = ctx.input.map((imageUrl) => {
    ctx.log.info('图片地址:' + imageUrl)
    const info = getUrlInfo(imageUrl)
    ctx.log.info('图片信息:' + JSON.stringify(info))
    if (ALLOW_EXTNAME.includes(info.extname.toLowerCase())) {
      switch (compress) {
        case CompressType.tinypng:
          return key ? TinypngKeyCompress(ctx, { imageUrl, key }) : TinypngCompress(ctx, { imageUrl })
        case CompressType.imagemin:
          return ImageminCompress(ctx, { imageUrl })
        case CompressType.image2webp:
          return Image2WebPCompress(ctx, { imageUrl })
        default:
          return key ? TinypngKeyCompress(ctx, { imageUrl, key }) : TinypngCompress(ctx, { imageUrl })
      }
    }
    ctx.log.warn('不支持的格式，跳过压缩')
    return SkipCompress(ctx, { imageUrl })
  })

  return Promise.all(tasks).then((output) => {
    ctx.log.info(
      '图片信息:' + JSON.stringify(output.map((item) => ({ fileName: item.fileName, extname: item.extname, height: item.height, width: item.width })))
    )
    ctx.output = output
    return ctx
  })
}

module.exports = function (ctx: PicGo): any {
  return {
    transformer: 'compress',
    register() {
      ctx.helper.transformer.register('compress', { handle })
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
          default: config.compress || CompressType.tinypng,
          required: true,
        },
        {
          name: 'key',
          type: 'input',
          message: '申请key，不填默认使用WebApi，逗号隔开，可使用多个Key叠加使用次数',
          default: config.key || config.tinypngKey || null,
          required: false,
        },
      ]
    },
  }
}
