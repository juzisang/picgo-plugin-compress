import PicGo from 'picgo'

function handle(ctx: PicGo) {
  console.log(ctx.input)
  console.log(ctx.output)
}

module.exports = function (ctx: PicGo): any {
  return {
    register: (): void => {
      ctx.helper.transformer.register('compress', {
        handle,
      })
    },
    transformer: 'compress',
  }
}
