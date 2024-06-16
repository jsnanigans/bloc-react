import {
  Blac,
  BlocBase,
  BlocConstructor,
  BlocGeneric,
  BlocHookDependencyArrayFn,
  BlocInstanceId,
  BlocState,
  InferPropsFromGeneric,
} from 'blac';
import { useId, useLayoutEffect, useMemo, useSyncExternalStore } from 'react';
import externalBlocStore from './externalBlocStore';

// export type BlocHookData<B extends BlocBase<S>, S> = [
//   value: ValueType<B>,
//   instance: B,
// ];

type HookTypes<B extends BlocConstructor<BlocGeneric>> = [
  BlocState<InstanceType<B>>,
  InstanceType<B>,
];

// type BlocHookData<B extends BlocBase<S>, S> = [S, InstanceType<B>]; // B is the bloc class, S is the state of the bloc
// type UseBlocClassResult<B, S> = BlocHookData<B, S>;

export interface BlocHookOptions<B extends BlocGeneric<any, any>> {
  id?: string;
  dependencySelector?: BlocHookDependencyArrayFn<B>;
  props?: InferPropsFromGeneric<B>;
}

export class UseBlocClass {
  static ridUsedKeys: Map<string, Set<string>> = new Map();
  static getUsedKeys = (rid: string): Set<string> => {
    if (!UseBlocClass.ridUsedKeys.has(rid)) {
      UseBlocClass.ridUsedKeys.set(rid, new Set());
    }
    return UseBlocClass.ridUsedKeys.get(rid) as Set<string>;
  };

  static useBloc<
    B extends BlocConstructor<BlocGeneric>,
    O extends BlocHookOptions<InstanceType<B>>,
  >(bloc: B, options?: O): HookTypes<B> {
    const rid = useId();
    const usedKeys = UseBlocClass.getUsedKeys(rid);

    // default options
    let dependencyArray: BlocHookDependencyArrayFn<InstanceType<B>> = (
      newState,
    ) => {
      if (typeof newState !== 'object') {
        return [newState] as unknown[];
      }

      const used: unknown[] = [];
      for (const key of usedKeys) {
        used.push(newState[key]);
      }
      return used;
    };
    let blocId: BlocInstanceId | undefined;
    let props: ConstructorParameters<BlocConstructor<B>> | undefined;

    if (typeof options === 'object') {
      dependencyArray = options.dependencySelector ?? dependencyArray;
      blocId = options.id;
      props = options.props ?? props;
    }

    const base = bloc as unknown as BlocBase<B, O['props']>;
    const isIsolated = base.isolated;
    if (isIsolated) {
      blocId = rid;
    }

    const resolvedBloc = Blac.getInstance().getBloc(bloc, {
      id: blocId,
      props,
      reconnect: false,
    }) as InstanceType<B>;

    if (!resolvedBloc) {
      throw new Error(`useBloc: could not resolve: ${bloc.name || bloc}`);
    }

    const { subscribe, getSnapshot, getServerSnapshot } = useMemo(
      () => externalBlocStore(resolvedBloc, dependencyArray),
      [resolvedBloc.createdAt],
    );

    const state = useSyncExternalStore<BlocState<InstanceType<B>>>(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

    const currentRenderUsedKeys = new Set<string>();
    const returnState: BlocState<InstanceType<B>> = useMemo(() => {
      try {
        if (typeof state === 'object') {
          return new Proxy(state as any, {
            get(target, prop) {
              usedKeys.add(prop as string);
              currentRenderUsedKeys.add(prop as string);
              return Reflect.get(target, prop);
            },
          });
        }
      } catch (error) {
        Blac.instance.log('useBloc Error', error);
      }
      return state;
    }, [state]);

    useLayoutEffect(() => {
      UseBlocClass.getUsedKeys(rid).clear();
      for (const key of currentRenderUsedKeys) {
        UseBlocClass.getUsedKeys(rid).add(key);
      }
    }, [currentRenderUsedKeys, rid]);

    return [returnState, resolvedBloc];
  }
}

const useBloc = UseBlocClass.useBloc;

export default useBloc;
