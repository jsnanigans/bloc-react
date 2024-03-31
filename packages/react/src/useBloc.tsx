import {
  Blac,
  BlocBase,
  BlocConstructor,
  BlocGeneric,
  BlocInstanceId,
  BlocProps,
  CubitPropsType,
  InferStateFromGeneric,
  ValueType,
} from 'blac';
import { useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import externalBlocStore from './externalBlocStore';

// export type BlocHookData<B extends BlocBase<S>, S> = [
//   value: ValueType<B>,
//   instance: B,
// ];

type HookTypes<
  B extends BlocConstructor<BlocGeneric<S, A>>,
  S = any,
  A = any,
> = [InferStateFromGeneric<InstanceType<B>>, InstanceType<B>];

// type BlocHookData<B extends BlocBase<S>, S> = [S, InstanceType<B>]; // B is the bloc class, S is the state of the bloc
// type UseBlocClassResult<B, S> = BlocHookData<B, S>;

export type BlocHookDependencyArrayFn<B extends BlocGeneric<any, any>> = (
  state: InferStateFromGeneric<B>,
) => unknown[];

export interface BlocHookOptions<B extends BlocGeneric<any, any>> {
  id?: string;
  dependencySelector?: BlocHookDependencyArrayFn<B>;
  props?: CubitPropsType<B>;
}

export class UseBlocClass {
  // static useBloc<B extends BlocConstructor<BlocBase<S>>, S>(
  //   bloc: B,
  // ): BlocHookData<InstanceType<B>, S> {
  // static useBloc<B extends BlocConstructor<BlocBase<S>>, S>(
  //   bloc: B,
  //   depsSelector: BlocHookDependencyArrayFn<InstanceType<B>, S>,
  // ): BlocHookData<InstanceType<B>, S>;
  // static useBloc<B extends BlocConstructor<BlocBase<S>>, S>(
  //   bloc: B,
  //   instanceId: string,
  // ): BlocHookData<InstanceType<B>, S>;
  // static useBloc<B extends BlocConstructor<BlocBase<S>>, S>(
  //   bloc: B,
  //   options?:
  //     | BlocHookOptions<InstanceType<B>, S>
  //     | BlocHookDependencyArrayFn<InstanceType<B>, S>
  //     | BlocInstanceId,
  // ): BlocHookData<InstanceType<B>, S> {

  // constructor, no options
  static useBloc<
    B extends BlocConstructor<BlocGeneric<S, A>>,
    S = any,
    A = any,
  >(bloc: B, options?: BlocHookOptions<InstanceType<B>>): HookTypes<B> {
    const rid = useId();
    // default options
    let dependencyArray: BlocHookDependencyArrayFn<InstanceType<B>> = (
      state: InferStateFromGeneric<B>,
    ) => [state];
    let blocId: BlocInstanceId | undefined;
    let props: BlocProps | undefined;

    // parse options

    // if options is a function, its a dependencySelector
    // if (typeof options === 'function') {
    //   dependencyArray = options;
    // }
    //
    // if options is a string its an ID
    // if (typeof options === 'string') {
    //   blocId = options;
    // }

    if (typeof options === 'object') {
      dependencyArray = options.dependencySelector ?? dependencyArray;
      blocId = options.id;
      props = options.props ?? props;
    }

    const base = bloc as unknown as BlocBase<S>;
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

    return [state, resolvedBloc];
  }
}

const useBloc = UseBlocClass.useBloc;

export default useBloc;
