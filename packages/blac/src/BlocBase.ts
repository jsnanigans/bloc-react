import { Blac, BlacEvent } from './Blac';
import { BlacObservable } from './BlacObserver';
import { BlocProps } from './Cubit';
import BlacAddon from './addons/BlacAddon';

export type BlocInstanceId = string | number | undefined;

export abstract class BlocBase<S, P extends BlocProps = {}> {
  static isolated = false;
  static keepAlive = false;
  static create: <S extends any>() => BlocBase<S>;
  static isBlacClass = true;
  static _propsOnInit: BlocProps | undefined;
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
    this.blac.report(BlacEvent.BLOC_CREATED, this);
    this.id = this.constructor.name;
    this.isolated = (this.constructor as any).isolated;
    this.addons = (this.constructor as any).addons;
    this.connectAddons();
  }

  private localProps?: P;
  get props(): typeof this.localProps {
    if (this.localProps) {
      return this.localProps;
    }

    const constructorProps = (this.constructor as any)._propsOnInit;
    if (constructorProps) {
      this.localProps = constructorProps;
      return constructorProps;
    }

    return undefined;
  }

  set props(props: P) {
    this.localProps = props;
  }

  public _state: S;

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

  addEventListenerStateChange = (
    callback: (newState: S, oldState: S) => void,
  ): (() => void) => {
    this.blac.report(BlacEvent.LISTENER_ADDED, this);
    this.observer.subscribe(callback);
    return () => this.handleUnsubscribe(callback);
  };

  dispose() {
    this.blac.report(BlacEvent.BLOC_DISPOSED, this);
    this.isBlacLive = false;
    this.observer.dispose();
    // this.onDisconnect?.();
  }

  private handleUnsubscribe = (
    callback: (newState: S, oldState: S) => void,
  ): void => {
    this.observer.unsubscribe(callback);
    this.blac.report(BlacEvent.LISTENER_REMOVED, this);
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

  pushState = (newState: S, oldState: S): void => {
    this._state = newState;
    this.observer.notify(newState, oldState);

    this.blac.report(BlacEvent.STATE_CHANGED, this, {
      newState,
      oldState,
    });
  };
}
