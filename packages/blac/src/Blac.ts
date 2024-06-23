import { BlocBase, BlocInstanceId } from './BlocBase';
import {
  BlocBaseAbstract,
  BlocConstructor,
  InferPropsFromGeneric,
} from './types';
import { BlacPlugin } from './BlacPlugin';
import BlacEvent from './BlacEvent';

export interface BlacConfig {
  exposeBlacInstance?: boolean;
}

export enum BlacLifecycleEvent {
  BLOC_DISPOSED = 'BLOC_DISPOSED',
  BLOC_CREATED = 'BLOC_CREATED',
  BLOC_RESURRECTED = 'BLOC_RESURRECTED',
  LISTENER_REMOVED = 'LISTENER_REMOVED',
  LISTENER_ADDED = 'LISTENER_ADDED',
  STATE_CHANGED = 'STATE_CHANGED',
}

export interface EventParams {
  [BlacLifecycleEvent.BLOC_DISPOSED]: undefined;
  [BlacLifecycleEvent.BLOC_CREATED]: undefined;
  [BlacLifecycleEvent.BLOC_RESURRECTED]: undefined;
  [BlacLifecycleEvent.LISTENER_REMOVED]: undefined;
  [BlacLifecycleEvent.LISTENER_ADDED]: undefined;
  [BlacLifecycleEvent.STATE_CHANGED]: {
    newState: any;
    oldState: any;
  };
}

export class Blac {
  static instance: Blac = new Blac();
  createdAt = Date.now();
  static getAllBlocs = Blac.instance.getAllBlocs;
  static addPlugin = Blac.instance.addPlugin;
  blocInstanceMap: Map<string, BlocBase<any, any>> = new Map();
  isolatedBlocMap: Map<Function, BlocBase<any, any>[]> = new Map();
  pluginList: BlacPlugin[] = [];
  postChangesToDocument = false;

  constructor(options: { __unsafe_ignore_singleton?: boolean } = {}) {
    const { __unsafe_ignore_singleton = false } = options;
    if (Blac.instance && !__unsafe_ignore_singleton) {
      return Blac.instance;
    }
    Blac.instance = this;
  }

  dispatchEvent = <T>(event: BlacEvent<T>) => {
    this.log('Broadcast signal', event);

    const allBlocs = Array.from(this.blocInstanceMap.values());
    allBlocs.forEach((bloc) => {
      bloc._onEvent?.(event);
    });
  };

  static dispatchEvent = Blac.instance.dispatchEvent;

  static enableLog = false;
  log = (...args: any[]) => {
    if (Blac.enableLog) console.log(`☢️ [Blac ${this.createdAt}]`, ...args);
  };

  static getInstance(): Blac {
    return Blac.instance;
  }

  resetInstance(): void {
    this.log('Reset Blac instance');
    Blac.instance = new Blac({
      __unsafe_ignore_singleton: true,
    });
  }

  addPlugin = (plugin: BlacPlugin): void => {
    // check if already added
    const index = this.pluginList.findIndex((p) => p.name === plugin.name);
    if (index !== -1) return;
    this.log('Add plugin', plugin.name);
    this.pluginList.push(plugin);
  };

  reportToPlugins = <B extends BlacLifecycleEvent>(
    event: B,
    bloc: BlocBase<any, any>,
    params?: EventParams[B],
  ) => {
    this.pluginList.forEach((plugin) => {
      plugin.onEvent(event, bloc, params);
    });
  };

  report = <B extends BlacLifecycleEvent>(
    event: B,
    bloc: BlocBase<any, any>,
    params?: EventParams[B],
  ) => {
    const base = bloc.constructor as unknown as BlocBaseAbstract;

    this.log(event, bloc, params);

    switch (event) {
      case BlacLifecycleEvent.BLOC_DISPOSED:
        this.disposeBloc(bloc);
        break;
      case BlacLifecycleEvent.LISTENER_REMOVED:
        if (bloc._observer.size === 0 && !base.keepAlive) void bloc._dispose();
        break;
      case BlacLifecycleEvent.LISTENER_ADDED:
        if (bloc._observer.size <= 1) bloc._resurrect();
        break;
      case BlacLifecycleEvent.BLOC_RESURRECTED:
        this.resurrectBloc(bloc);
        break;
    }

    this.reportToPlugins(event, bloc, params);
  };

  disposeBloc = (bloc: BlocBase<any, any>): void => {
    const base = bloc.constructor as unknown as BlocBaseAbstract;
    bloc._isBlacLive = false;
    if (base.isolated) {
      this.unregisterIsolatedBlocInstance(bloc);
    } else {
      this.unregisterBlocInstance(bloc);
    }
  };

  resurrectBloc = (bloc: BlocBase<any, any>): void => {
    const base = bloc.constructor as unknown as BlocBaseAbstract;
    bloc._isBlacLive = true;
    if (base.isolated) {
      this.registerIsolatedBlocInstance(bloc);
    } else {
      this.registerBlocInstance(bloc);
    }
  };

  createBlocInstanceMapKey(blocClassName: string, id: BlocInstanceId): string {
    return `${blocClassName}:${id}`;
  }

  unregisterBlocInstance(bloc: BlocBase<any, any>): void {
    const key = this.createBlocInstanceMapKey(bloc._name, bloc._id);
    this.blocInstanceMap.delete(key);
  }

  registerBlocInstance(bloc: BlocBase<any, any>): void {
    const key = this.createBlocInstanceMapKey(bloc._name, bloc._id);
    this.blocInstanceMap.set(key, bloc);
  }

  findRegisteredBlocInstance<B extends BlocBase<any, any>>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
  ): InstanceType<BlocConstructor<B>> | undefined {
    const base = blocClass as unknown as BlocBaseAbstract;
    if (base.isolated) return undefined;

    const key = this.createBlocInstanceMapKey(blocClass.name, id);
    return this.blocInstanceMap.get(key) as InstanceType<BlocConstructor<B>>;
  }

  registerIsolatedBlocInstance(bloc: BlocBase<any, any>): void {
    const blocClass = bloc.constructor;
    const blocs = this.isolatedBlocMap.get(blocClass);
    if (blocs) {
      blocs.push(bloc);
    } else {
      this.isolatedBlocMap.set(blocClass, [bloc]);
    }
  }

  unregisterIsolatedBlocInstance(bloc: BlocBase<any, any>): void {
    const blocClass = bloc.constructor;
    const blocs = this.isolatedBlocMap.get(blocClass);
    if (blocs) {
      const index = blocs.findIndex((b) => b._id === bloc._id);
      blocs.splice(index, 1);

      if (blocs.length === 0) {
        this.isolatedBlocMap.delete(blocClass);
      }
    }
  }

  findIsolatedBlocInstance<B extends BlocBase<any, any>>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
  ): InstanceType<BlocConstructor<B>> | undefined {
    const blocs = this.isolatedBlocMap.get(blocClass);
    if (blocs) {
      return blocs.find((b) => b._id === id) as InstanceType<
        BlocConstructor<B>
      >;
    }
    return undefined;
  }

  createNewBlocInstance<B extends BlocBase>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
    props?: InferPropsFromGeneric<B>,
  ): InstanceType<BlocConstructor<B>> {
    const base = blocClass as unknown as BlocBaseAbstract;

    const newBloc = new blocClass(props as never);
    newBloc._updateId(id);

    if (base.isolated) {
      this.registerIsolatedBlocInstance(newBloc);
      return newBloc as InstanceType<BlocConstructor<any>>;
    }

    this.registerBlocInstance(newBloc);
    return newBloc as InstanceType<BlocConstructor<any>>;
  }

  getBloc<B extends BlocConstructor<any>>(
    blocClass: B,
    options: {
      id?: BlocInstanceId;
      props?: InferPropsFromGeneric<B>;
      reconnect?: boolean;
    } = {},
  ): InstanceType<B> {
    const isIsolated = (blocClass as InstanceType<B>).isolated;
    const id = options.id || blocClass.name;

    const registered = isIsolated
      ? this.findIsolatedBlocInstance(blocClass, id)
      : this.findRegisteredBlocInstance(blocClass, id);

    const { reconnect } = options;

    if (registered) {
      if (reconnect) {
        registered.dispose();
      } else {
        return registered;
      }
    }
    return this.createNewBlocInstance(blocClass, id, options.props);
  }

  getAllBlocs = <B extends BlocBase<any, any>>(
    blocClass: BlocConstructor<B>,
    options: {
      searchIsolated?: boolean;
    } = {},
  ): B[] => {
    const base = blocClass as unknown as BlocBaseAbstract;

    const { searchIsolated = base.isolated } = options;

    if (searchIsolated) {
      const blocs = this.isolatedBlocMap.get(blocClass);
      if (blocs) return blocs as B[];
    } else {
      const blocs = Array.from(this.blocInstanceMap.values());
      return blocs.filter((b) => b instanceof blocClass) as B[];
    }
    return [];
  };
}
