import { NameType } from './enums'

export function reName(nameType: string, name: string): string {
  switch (nameType) {
    case NameType.timestamp:
      return `${Date.now()}`
    case NameType.none:
      return name
    default:
      return `${Date.now()}`
  }
}
