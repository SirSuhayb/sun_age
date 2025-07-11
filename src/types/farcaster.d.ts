declare module '@farcaster/frame-core' {
  // Core types
  export type SetPrimaryButtonOptions = {
    text: string
    loading?: boolean
    disabled?: boolean
    hidden?: boolean
  }

  export type SetPrimaryButton = (options: SetPrimaryButtonOptions) => void

  export type MiniAppHostCapability =
    | 'wallet.getEthereumProvider'
    | 'wallet.getSolanaProvider'
    | 'actions.ready'
    | 'actions.openUrl'
    | 'actions.close'
    | 'actions.setPrimaryButton'
    | 'actions.addMiniApp'
    | 'actions.signIn'
    | 'actions.viewCast'
    | 'actions.viewProfile'
    | 'actions.composeCast'
    | 'actions.viewToken'
    | 'actions.sendToken'
    | 'actions.swapToken'

  export type GetCapabilities = () => Promise<MiniAppHostCapability[]>
  export type GetChains = () => Promise<string[]>

  // Frame types
  export type FrameClientEvent = {
    event: string
    [key: string]: any
  }

  // Context types
  export type FrameContext = {
    [key: string]: any
  }

  // Ready types
  export type ReadyOptions = {
    [key: string]: any
  }

  export const DEFAULT_READY_OPTIONS: ReadyOptions

  // SignIn types
  export type SignInOptions = {
    [key: string]: any
  }

  // Ethereum types
  export type EthProvideRequest = (...args: any[]) => Promise<any>
  export type RpcTransport = (...args: any[]) => Promise<any>

  // Override problematic exports
  export type { DEFAULT_READY_OPTIONS as DEFAULT_READY_OPTIONS_TYPE, ReadyOptions as ReadyOptionsType } from './actions/Ready'
  export type { SignInOptions as SignInOptionsType } from './actions/SignIn'
}

declare module '@farcaster/frame-core/context' {
  export type FrameContext = {
    [key: string]: any
  }
} 