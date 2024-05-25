import { Blac, BlacLifecycleEvent } from './Blac';
import BlacEvent from './BlacEvent';
import { BlacObservable, BlacObserver } from './BlacObserver';
import BlacAddon from './addons/BlacAddon';

export type BlocInstanceId = string | number | undefined;

export abstract class BlocBase<S, P> {
  static isolated = false;
  static keepAlive = false;
  static create: <S extends any, P>() => BlocBase<S, P>;
  static isBlacClass = true;
  static addons?: BlacAddon[];
  public addons?: BlacAddon[];
  public isolated = false;
  public isBlacLive = true;
  public observer: BlacObservable<any>;
  public blac = Blac.getInstance();
  public id: BlocInstanceId;
  public readonly createdAt = Date.now();

  constructor(initialState: S) {
    this.observer = new BlacObservable();
    this._state = initialState;
    this.blac.report(BlacLifecycleEvent.BLOC_CREATED, this);
    this.id = this.constructor.name;
    this.isolated = (this.constructor as any).isolated;
    this.addons = (this.constructor as any).addons;
    this.connectAddons();
  }

  public _state: S;
  public _props: P = undefined as P;

  get state(): S {
    return this._state;
  }

  get name() {
    return this.constructor.name;
  }

  updateId = (id?: BlocInstanceId) => {
    const originalId = this.id;
    if (!id || id === originalId) return;
    this.id = id;
  };

  addSubscriber = (
    callback: (newState: S, oldState: S) => void,
  ): (() => void) => {
    this.blac.report(BlacLifecycleEvent.LISTENER_ADDED, this);
    this.observer.subscribe(callback);
    return () => this.handleUnsubscribe(callback);
  };

  dispose() {
    this.blac.report(BlacLifecycleEvent.BLOC_DISPOSED, this);
    this.isBlacLive = false;
    this.observer.dispose();
    // this.onDisconnect?.();
  }

  handleUnsubscribe = (callback: BlacObserver<S>): void => {
    setTimeout(() => {
      this.observer.unsubscribe(callback);
      this.blac.report(BlacLifecycleEvent.LISTENER_REMOVED, this);
    }, 0);
  };

  connectAddons = () => {
    const { addons } = this;

    if (!addons) return;

    for (const addon of addons) {
      if (addon.onEmit) {
        this.observer.subscribe((newState, oldState) => {
          addon.onEmit?.({
            newState,
            oldState,
            cubit: this,
          });
        });
      }
      if (addon.onInit) {
        addon.onInit(this);
      }
    }
  };

  pushState = (newState: S, oldState: S, action?: any): void => {
    this._state = newState;
    this.observer.notify(newState, oldState, action);

    this.blac.report(BlacLifecycleEvent.STATE_CHANGED, this, {
      newState,
      oldState,
    });
  };

  onEvent(event: BlacEvent): void {}
}
