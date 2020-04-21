import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'

export function imageminCompress(file: Buffer): Promise<Buffer> {
  return imagemin.buffer(file, {
    plugins: [
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 })
    ],
  })
}
