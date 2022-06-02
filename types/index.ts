export interface WalterService {
  name: string
  init: Function
  use?: Function
  [other: string]: any
}

export interface WalterConfig {
  [other: string]: any
}

export interface RawModule {
  default: WalterService
  [other: string]: any
}