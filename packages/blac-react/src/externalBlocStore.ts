import { BlocGeneric, BlocHookDependencyArrayFn, BlocState } from 'blac-next';

export interface ExternalStore<
  B extends BlocGeneric<any, any>,
  S extends BlocState<B>,
> {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => S;
  getServerSnapshot?: () => S;
}

const externalBlocStore = <
  B extends BlocGeneric<any, any>,
  S extends BlocState<B>,
>(
  bloc: B,
  dependencyArray: BlocHookDependencyArrayFn<InstanceType<any>>,
  rid: string,
): ExternalStore<B, S> => {
  return {
    subscribe: (listener: (state: S) => void) => {
      const unSub = bloc._observer.subscribe({
        fn: () => {
          try {
            listener(Object.freeze(bloc.state));
          } catch (e) {
            console.error({
              e,
              bloc,
              dependencyArray,
            });
          }
        },
        dependencyArray,
        id: rid,
      });

      return () => {
        unSub();
      };
    },
    getSnapshot: (): S => Object.freeze(bloc.state),
    getServerSnapshot: (): S => Object.freeze(bloc.state),
  };
};

export default externalBlocStore;
