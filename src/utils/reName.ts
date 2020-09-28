import { NameType } from '../config'
import * as path from 'path'

export function reName(nameType: string, url: string): string {
  const fileName = path.basename(url)
  switch (nameType) {
    case NameType.timestamp:
      return `${Date.now()}-` + fileName.replace('.png', '.jpg')
    case NameType.none:
    default:
      return `${fileName}`.replace('.png', '.jpg')
  }
}
