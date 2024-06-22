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
import {
  startTransition,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
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

const defaultDependencySelector: BlocHookDependencyArrayFn<any> = (s) => [s];

export class UseBlocClass {
  static useBloc<
    B extends BlocConstructor<BlocGeneric>,
    O extends BlocHookOptions<InstanceType<B>>,
  >(bloc: B, options?: O): HookTypes<B> {
    let { dependencySelector, id: blocId, props } = options ?? {};
    const rid = useId();
    const usedKeys = useRef<Set<string>>(new Set());
    const instanceKeys = useRef<Set<string>>(new Set());
    const renderInstance = new Set();

    const base = bloc as unknown as BlocBase<B, O['props']>;
    const isIsolated = base.isolated;
    if (isIsolated) {
      blocId = rid;
    }

    const resolvedBloc = Blac.getInstance().getBloc(bloc, {
      id: blocId,
      props: props as any,
      reconnect: false,
    }) as InstanceType<B>;

    if (!resolvedBloc) {
      throw new Error(`useBloc: could not resolve: ${bloc.name || bloc}`);
    }

    // default options
    const dependencyArray: BlocHookDependencyArrayFn<InstanceType<B>> = (
      newState,
      oldState,
    ) => {
      if (dependencySelector) {
        return dependencySelector(newState, oldState);
      }
      if (typeof newState !== 'object') {
        return defaultDependencySelector(newState, oldState);
      }

      const used: string[] = [];
      for (const key of usedKeys.current) {
        if (key in newState) {
          used.push(newState[key as keyof typeof newState]);
        }
      }

      return used;
    };

    const { subscribe, getSnapshot, getServerSnapshot } = useMemo(
      () => externalBlocStore(resolvedBloc, dependencyArray),
      [resolvedBloc.createdAt],
    );

    const state = useSyncExternalStore<BlocState<InstanceType<B>>>(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

    const returnState: BlocState<InstanceType<B>> = useMemo(() => {
      try {
        if (typeof state === 'object') {
          return new Proxy(state as any, {
            get(target, prop) {
              usedKeys.current.add(prop as string);
              instanceKeys.current.add(prop as string);
              return Reflect.get(target, prop);
            },
          });
        }
      } catch (error) {
        Blac.instance.log('useBloc Error', error);
      }
      return state;
    }, [state, usedKeys, instanceKeys]);

    useLayoutEffect(() => {
      let running = true;
      usedKeys.current = new Set(instanceKeys.current);
      setTimeout(() => {
        if (running) {
          instanceKeys.current.clear();
        }
      });

      return () => {
        running = false;
      };
    }, [renderInstance]);

    return [returnState, resolvedBloc];
  }
}

const useBloc = UseBlocClass.useBloc;

export default useBloc;
