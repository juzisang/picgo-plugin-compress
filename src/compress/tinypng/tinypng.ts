import * as path from 'path'
import * as fs from 'fs-extra'
import { getImageBuffer, isNetworkUrl } from '../../utils'
import { TINYPNG_UPLOAD_URL } from '../../config'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import PicGo from 'picgo'
import { Response } from 'request'

interface TinyPngOptions {
  keys: string[]
  ctx: PicGo
}

interface TinyCacheConfig {
  [key: string]: {
    key: string
    num: number
  }
}

class TinyPng {
  private cacheConfigPath = path.join(__dirname, 'config.json')
  private options!: TinyPngOptions
  private PicGo!: PicGo

  async init(options: TinyPngOptions) {
    this.PicGo = options.ctx
    this.options = options
    await this.readOrWriteConfig(this.options.keys)
    this.PicGo.log.info('TinyPng初始化')
  }

  async upload(url: string) {
    this.PicGo.log.info('TinyPng开始上传')
    if (isNetworkUrl(url)) {
      return this.uploadImage({ url, originalUrl: url, key: await this.getKey() })
    } else {
      return this.uploadImage({
        key: await this.getKey(),
        originalUrl: url,
        buffer: await getImageBuffer(this.PicGo, url),
      })
    }
  }

  private async getKey() {
    const config = await this.readOrWriteConfig()
    const innerKeys = Object.keys(config).filter((key) => config[key].num !== -1)
    if (innerKeys.length <= 0) {
      throw new Error('使用次数用完')
    }
    return innerKeys[0]
  }

  private uploadImage(options: { key: string; originalUrl: string; url?: string; buffer?: Buffer }): Promise<Buffer> {
    this.PicGo.log.info('使用TinypngKey:' + options.key)

    const bearer = Base64.stringify(Utf8.parse(`api:${options.key}`))

    const fetchOptions = {
      method: 'POST',
      url: TINYPNG_UPLOAD_URL,
      json: true,
      resolveWithFullResponse: true,
      headers: {
        Host: 'api.tinify.com',
        Authorization: `Basic ${bearer}`,
      },
    }

    if (options.url) {
      this.PicGo.log.info('TinyPng 上传网络图片')
      Object.assign(fetchOptions.headers, {
        'Content-Type': 'application/json',
      })
      Object.assign(fetchOptions, {
        body: {
          source: {
            url: options.url,
          },
        },
      })
    }

    const req = this.PicGo.Request.request(fetchOptions)

    if (options.buffer) {
      this.PicGo.log.info('TinyPng 上传本地图片')
      req.end(options.buffer)
    }

    return req.then((response: Response) => {
      this.setConfig(options.key, parseInt(response.headers['compression-count'] as any))
      if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
        console.log(response.statusCode)
        console.log(response.headers.location)
        return getImageBuffer(this.PicGo, response.headers.location as any)
      }
      if (response.statusCode === 429) {
        this.setConfig(options.key, -1)
        return this.upload(options.originalUrl)
      }
      throw new Error('未知错误')
    })
  }

  private async setConfig(key: string, num: number) {
    const config = await this.readOrWriteConfig()
    config[key] = {
      key,
      num,
    }
    await fs.writeJSON(this.cacheConfigPath, config)
  }

  private async readOrWriteConfig(keys?: string[]): Promise<TinyCacheConfig> {
    const config: TinyCacheConfig = {}
    if (await fs.pathExists(this.cacheConfigPath)) {
      Object.assign(config, await fs.readJSON(this.cacheConfigPath))
    } else {
      await fs.writeJSON(this.cacheConfigPath, {})
    }
    if (keys) {
      await fs.writeJSON(
        this.cacheConfigPath,
        keys.reduce((res, key) => {
          if (!res[key]) {
            res[key] = {
              key,
              num: 0,
            }
          }
          return res
        }, config)
      )
    }
    return config
  }
}

export default new TinyPng()
