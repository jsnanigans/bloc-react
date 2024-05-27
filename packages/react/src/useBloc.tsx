import {
  Blac,
  BlocBase,
  BlocConstructor,
  BlocGeneric,
  BlocInstanceId,
  InferPropsFromGeneric,
  InferStateFromGeneric,
} from 'blac';
import { useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import externalBlocStore from './externalBlocStore';

// export type BlocHookData<B extends BlocBase<S>, S> = [
//   value: ValueType<B>,
//   instance: B,
// ];

type HookTypes<B extends BlocConstructor<BlocGeneric>> = [
  InferStateFromGeneric<InstanceType<B>>,
  InstanceType<B>,
];

// type BlocHookData<B extends BlocBase<S>, S> = [S, InstanceType<B>]; // B is the bloc class, S is the state of the bloc
// type UseBlocClassResult<B, S> = BlocHookData<B, S>;

export type BlocHookDependencyArrayFn<B extends BlocGeneric<any, any>> = (
  state: InferStateFromGeneric<B>,
) => unknown[];

export interface BlocHookOptions<B extends BlocGeneric<any, any>> {
  id?: string;
  dependencySelector?: BlocHookDependencyArrayFn<B>;
  props?: InferPropsFromGeneric<B>;
}

export class UseBlocClass {
  static useBloc<
    B extends BlocConstructor<BlocGeneric>,
    O extends BlocHookOptions<InstanceType<B>>,
  >(bloc: B, options?: O): HookTypes<B> {
    const rid = useId();
    const usedKeys: string[] = [];
    // default options
    let dependencyArray: BlocHookDependencyArrayFn<InstanceType<B>> = (
      state,
    ) => {
      if (typeof state !== 'object') {
        return [state] as unknown[];
      }

      const used: unknown[] = [];
      for (const key in state) {
        if (usedKeys.includes(key)) {
          used.push(state[key]);
        }
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

    const state = useSyncExternalStore<InferStateFromGeneric<S>>(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

    useEffect(() => {
      if ((resolvedBloc.isolated && props) || (props && !resolvedBloc.props)) {
        resolvedBloc.props = props;
      }
    }, [props]);

    let returnState = state;
    if (typeof state === 'object') {
      returnState = new Proxy(state, {
        get(target, prop) {
          usedKeys.push(prop as string);
          return Reflect.get(target, prop);
        },
      });
    }

    return [returnState, resolvedBloc];
  }
}

const useBloc = UseBlocClass.useBloc;

export default useBloc;
