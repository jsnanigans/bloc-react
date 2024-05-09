import { BlocBase, BlocInstanceId } from './BlocBase';
import { BlocBaseAbstract, BlocConstructor, BlocGeneric } from './types';
import { BlocProps } from './Cubit';
import { BlacPlugin } from './BlacPlugin';

export interface BlacConfig {
  exposeBlacInstance?: boolean;
}

export enum BlacEvent {
  BLOC_DISPOSED = 'BLOC_DISPOSED',
  LISTENER_REMOVED = 'LISTENER_REMOVED',
  LISTENER_ADDED = 'LISTENER_ADDED',
  STATE_CHANGED = 'STATE_CHANGED',
  BLOC_CREATED = 'BLOC_CREATED',
}

export interface EventParams {
  [BlacEvent.BLOC_DISPOSED]: undefined;
  [BlacEvent.LISTENER_REMOVED]: undefined;
  [BlacEvent.LISTENER_ADDED]: undefined;
  [BlacEvent.BLOC_CREATED]: undefined;
  [BlacEvent.STATE_CHANGED]: {
    newState: any;
    oldState: any;
  };
}

export class Blac {
  static instance: Blac = new Blac();
  createdAt = Date.now();
  static getAllBlocs = Blac.instance.getAllBlocs;
  static addPlugin = Blac.instance.addPlugin;
  static configure = Blac.instance.configure;
  blocInstanceMap: Map<string, BlocBase<any>> = new Map();
  isolatedBlocMap: Map<Function, BlocBase<any>[]> = new Map();
  pluginList: BlacPlugin[] = [];
  postChangesToDocument = false;

  constructor(options: { __unsafe_ignore_singleton?: boolean } = {}) {
    const { __unsafe_ignore_singleton = false } = options;
    if (Blac.instance && !__unsafe_ignore_singleton) {
      return Blac.instance;
    }

    this.log('Create new Blac instance');
    Blac.instance = this;
  }

  broadcastSignal = (signal: string, payload?: any) => {
    this.log('Broadcast signal', signal, payload);

    const allBlocs = Array.from(this.blocInstanceMap.values());
    console.log('allBlocs', allBlocs);
    allBlocs.forEach((bloc) => {
      bloc.onSignal?.(signal, payload);
    });
  };
  static broadcastSignal = Blac.instance.broadcastSignal;

  static enableLog = true;
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

  reportToPlugins = <B extends BlacEvent>(
    event: B,
    bloc: BlocBase<any>,
    params?: EventParams[B],
  ) => {
    this.pluginList.forEach((plugin) => {
      plugin.onEvent(event, bloc, params);
    });
  };

  report = <B extends BlacEvent>(
    event: B,
    bloc: BlocBase<any>,
    params?: EventParams[B],
  ) => {
    const base = bloc.constructor as unknown as BlocBaseAbstract;

    switch (event) {
      case BlacEvent.BLOC_DISPOSED:
        this.disposeBloc(bloc);
        break;
      case BlacEvent.LISTENER_REMOVED:
        if (bloc.observer.size === 0 && !base.keepAlive) this.disposeBloc(bloc);
        break;
    }

    this.reportToPlugins(event, bloc, params);
  };

  disposeBloc = (bloc: BlocBase<any>): void => {
    const base = bloc.constructor as unknown as BlocBaseAbstract;
    this.log('Dispose bloc', {
      bloc,
      blocName: bloc.name,
      blocId: bloc.id,
      isolated: base.isolated,
    });
    if (base.isolated) {
      this.unregisterIsolatedBlocInstance(bloc);
    } else {
      this.unregisterBlocInstance(bloc);
    }
  };

  createBlocInstanceMapKey(blocClassName: string, id: BlocInstanceId): string {
    return `${blocClassName}:${id}`;
  }

  unregisterBlocInstance(bloc: BlocBase<any>): void {
    const key = this.createBlocInstanceMapKey(bloc.name, bloc.id);
    this.log('Unregister bloc', key);
    this.blocInstanceMap.delete(key);
  }

  registerBlocInstance(bloc: BlocBase<any>): void {
    const key = this.createBlocInstanceMapKey(bloc.name, bloc.id);
    this.log('Register bloc', key);
    this.blocInstanceMap.set(key, bloc);
  }

  findRegisteredBlocInstance<B extends BlocBase<any>>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
  ): InstanceType<BlocConstructor<B>> | undefined {
    const base = blocClass as unknown as BlocBaseAbstract;
    if (base.isolated) return undefined;

    const key = this.createBlocInstanceMapKey(blocClass.name, id);
    return this.blocInstanceMap.get(key) as InstanceType<BlocConstructor<B>>;
  }

  registerIsolatedBlocInstance(bloc: BlocBase<any>): void {
    const blocClass = bloc.constructor;
    const blocs = this.isolatedBlocMap.get(blocClass);
    this.log('Register isolated bloc', blocClass.name, bloc.id);
    if (blocs) {
      blocs.push(bloc);
    } else {
      this.isolatedBlocMap.set(blocClass, [bloc]);
    }
  }

  unregisterIsolatedBlocInstance(bloc: BlocBase<any>): void {
    const blocClass = bloc.constructor;
    const blocs = this.isolatedBlocMap.get(blocClass);
    this.log('Unregister isolated bloc', blocClass.name, bloc.id);
    if (blocs) {
      const index = blocs.findIndex((b) => b.id === bloc.id);
      blocs.splice(index, 1);

      if (blocs.length === 0) {
        this.isolatedBlocMap.delete(blocClass);
      }
    }
  }

  findIsolatedBlocInstance<B extends BlocBase<any>>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
  ): InstanceType<BlocConstructor<B>> | undefined {
    const blocs = this.isolatedBlocMap.get(blocClass);
    if (blocs) {
      return blocs.find((b) => b.id === id) as InstanceType<BlocConstructor<B>>;
    }
    return undefined;
  }

  createNewBlocInstance<B extends BlocBase<any>>(
    blocClass: BlocConstructor<B>,
    id: BlocInstanceId,
    props: BlocProps | undefined,
  ): InstanceType<BlocConstructor<B>> {
    const base = blocClass as unknown as BlocBaseAbstract;
    const hasCreateMethod = Object.prototype.hasOwnProperty.call(
      blocClass,
      'create',
    );

    base._propsOnInit = props;
    const newBloc = hasCreateMethod ? base.create() : new blocClass();
    newBloc.updateId(id);

    this.log('Create new bloc instance', {
      blocClass,
      id,
      props,
      newBloc,
    });

    if (base.isolated) {
      this.registerIsolatedBlocInstance(newBloc);
      return newBloc as InstanceType<BlocConstructor<B>>;
    }

    this.registerBlocInstance(newBloc);
    return newBloc as InstanceType<BlocConstructor<B>>;
  }

  getBloc<B extends BlocConstructor<BlocGeneric<S, A>>, S = any, A = any>(
    blocClass: B,
    options: {
      id?: BlocInstanceId;
      props?: BlocProps;
      reconnect?: boolean;
    } = {},
  ): InstanceType<B> {
    const base = blocClass as unknown as InstanceType<B>;
    const isIsolated = base.isolated;
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

  getAllBlocs = <B extends BlocBase<any>>(
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

  configure = (config: BlacConfig) => {
    if (config.exposeBlacInstance) {
      // window.__blac = this;
    }
  };
}
