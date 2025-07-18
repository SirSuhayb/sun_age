import type { AddMiniApp, ComposeCast, Ready, SendToken, SignIn, SwapToken, ViewCast, ViewProfile, ViewToken } from './actions/index.js';
import type { FrameContext } from './context.js';
import type { EventFrameAdded, EventFrameRemoved, EventNotificationsDisabled, EventNotificationsEnabled } from './schemas/index.js';
import type { SolanaRequestFn, SolanaWireRequestFn } from './solana.js';
import type { Ethereum } from './wallet/index.js';
export type SetPrimaryButtonOptions = {
    text: string;
    loading?: boolean;
    disabled?: boolean;
    hidden?: boolean;
};
export * from './wallet/ethereum.ts';
export type { DEFAULT_READY_OPTIONS, ReadyOptions } from './actions/Ready.js';
export type SignInOptions = SignIn.SignInOptions;
export type SetPrimaryButton = (options: SetPrimaryButtonOptions) => void;
export declare const miniAppHostCapabilityList: [string, ...string[]];
export type MiniAppHostCapability = 'wallet.getEthereumProvider' | 'wallet.getSolanaProvider' | 'actions.ready' | 'actions.openUrl' | 'actions.close' | 'actions.setPrimaryButton' | 'actions.addMiniApp' | 'actions.signIn' | 'actions.viewCast' | 'actions.viewProfile' | 'actions.composeCast' | 'actions.viewToken' | 'actions.sendToken' | 'actions.swapToken';
export type GetCapabilities = () => Promise<MiniAppHostCapability[]>;
export type GetChains = () => Promise<string[]>;
export type WireFrameHost = {
    context: FrameContext;
    close: () => void;
    ready: Ready.Ready;
    openUrl: (url: string) => void;
    signIn: SignIn.WireSignIn;
    setPrimaryButton: SetPrimaryButton;
    ethProviderRequest: Ethereum.EthProvideRequest;
    ethProviderRequestV2: Ethereum.RpcTransport;
    eip6963RequestProvider: () => void;
    solanaProviderRequest?: SolanaWireRequestFn;
    addFrame: AddMiniApp.WireAddMiniApp;
    viewCast: ViewCast.ViewCast;
    viewProfile: ViewProfile.ViewProfile;
    viewToken: ViewToken.ViewToken;
    sendToken: SendToken.SendToken;
    swapToken: SwapToken.SwapToken;
    composeCast: <close extends boolean | undefined = undefined>(options: ComposeCast.Options<close>) => Promise<ComposeCast.Result<close>>;
    getCapabilities: GetCapabilities;
    getChains: GetChains;
};
export type FrameHost = {
    context: FrameContext;
    close: () => void;
    ready: Ready.Ready;
    openUrl: (url: string) => void;
    signIn: SignIn.SignIn;
    setPrimaryButton: SetPrimaryButton;
    ethProviderRequest: Ethereum.EthProvideRequest;
    ethProviderRequestV2: Ethereum.RpcTransport;
    /**
     * Receive forwarded eip6963:requestProvider events from the frame document.
     * Hosts must emit an EventEip6963AnnounceProvider in response.
     */
    eip6963RequestProvider: () => void;
    solanaProviderRequest?: SolanaRequestFn;
    addFrame: AddMiniApp.AddMiniApp;
    viewCast: ViewCast.ViewCast;
    viewProfile: ViewProfile.ViewProfile;
    viewToken: ViewToken.ViewToken;
    sendToken: SendToken.SendToken;
    swapToken: SwapToken.SwapToken;
    composeCast: <close extends boolean | undefined = undefined>(options: ComposeCast.Options<close>) => Promise<ComposeCast.Result<close>>;
    getCapabilities: GetCapabilities;
    getChains: GetChains;
};
export type EventFrameAddRejected = {
    event: 'frame_add_rejected';
    reason: AddMiniApp.AddMiniAppRejectedReason;
};
export type EventPrimaryButtonClicked = {
    event: 'primary_button_clicked';
};
export type FrameClientEvent = EventFrameAdded | EventFrameAddRejected | EventFrameRemoved | EventNotificationsEnabled | EventNotificationsDisabled | EventPrimaryButtonClicked | Ethereum.EventEip6963AnnounceProvider;
