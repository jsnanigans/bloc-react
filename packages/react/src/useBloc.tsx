import {
  Blac,
  BlocBase,
  BlocBaseAbstract,
  BlocConstructor,
  BlocGeneric,
  BlocHookDependencyArrayFn,
  BlocState,
  InferPropsFromGeneric,
} from 'blac';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import externalBlocStore from './externalBlocStore';

type HookTypes<B extends BlocConstructor<BlocGeneric>> = [
  BlocState<InstanceType<B>>,
  InstanceType<B>,
];

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
    const shouldClear = useRef(false);

    const base = bloc as unknown as BlocBaseAbstract;
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
      () => externalBlocStore(resolvedBloc, dependencyArray, rid),
      [resolvedBloc._createdAt],
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
              shouldClear.current = true;
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
      usedKeys.current = new Set(instanceKeys.current);

      return () => {
        setTimeout(() => {
          if (shouldClear.current) {
            instanceKeys.current.clear();
            shouldClear.current = false;
          }
        });
      };
    }, [renderInstance]);

    return [returnState, resolvedBloc];
  }
}

const useBloc = UseBlocClass.useBloc;

export default useBloc;
