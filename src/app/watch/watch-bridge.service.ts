import { Injectable } from '@angular/core';
import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WatchCommandAck, WatchCommandMessage, WatchStateMessage } from './watch-protocol';
import { WatchProtocolService } from './watch-protocol.service';

export interface WatchConnectionState { available: boolean; paired: boolean; reachable: boolean; }
interface NativeWatchBridge { isAvailable(): Promise<WatchConnectionState>; sendState(options: { state: WatchStateMessage }): Promise<void>; sendAcknowledgement(options: { acknowledgement: WatchCommandAck }): Promise<void>; requestState(): Promise<void>; addListener(eventName: 'command', listener: (command: WatchCommandMessage) => void): Promise<PluginListenerHandle>; addListener(eventName: 'connectionChanged', listener: (state: WatchConnectionState) => void): Promise<PluginListenerHandle>; }
const WatchBridgePlugin = registerPlugin<NativeWatchBridge>('WatchBridge');

@Injectable({ providedIn: 'root' })
export class WatchBridgeService {
  private readonly connectionSubject = new BehaviorSubject<WatchConnectionState>({ available: false, paired: false, reachable: false });
  readonly connection$ = this.connectionSubject.asObservable();
  private initialized = false;
  private stateSubscription?: Subscription;

  constructor(private readonly protocol: WatchProtocolService) {}

  initialize(): void {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    this.initialized = true;
    this.stateSubscription = this.protocol.state$.subscribe(state => { if (state) void this.sendState(state); });
    void this.listenForCommands();
    void this.listenForConnectionChanges();
    void this.refreshAvailability();
  }

  private async listenForCommands(): Promise<void> { await WatchBridgePlugin.addListener('command', command => { const acknowledgement = this.protocol.handleCommand(command); void WatchBridgePlugin.sendAcknowledgement({ acknowledgement }); }); }
  private async listenForConnectionChanges(): Promise<void> { await WatchBridgePlugin.addListener('connectionChanged', state => { this.connectionSubject.next(state); if (state.reachable && this.protocol.latestState) void this.sendState(this.protocol.latestState); }); }
  private async refreshAvailability(): Promise<void> { try { this.connectionSubject.next(await WatchBridgePlugin.isAvailable()); } catch { this.connectionSubject.next({ available: false, paired: false, reachable: false }); } }
  private async sendState(state: WatchStateMessage): Promise<void> { try { await WatchBridgePlugin.sendState({ state }); } catch { /* Native transport can retry after reconnect. */ } }
}