export interface ICompress {
  compressImg(file: string): Promise<Buffer>
}
