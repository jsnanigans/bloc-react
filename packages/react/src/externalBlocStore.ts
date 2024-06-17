import { BlocGeneric, BlocHookDependencyArrayFn, BlocState } from 'blac';

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
): ExternalStore<B, S> => {
  return {
    subscribe: (listener: (state: S) => void) => {
      const unSub = bloc.addSubscriber({
        fn: () => {
          try {
            listener(bloc.state);
          } catch (e) {
            console.error({
              e,
              bloc,
              dependencyArray,
            });
          }
        },
        dependencyArray,
      });

      return () => {
        unSub();
      };
    },
    getSnapshot: (): S => bloc.state,
    getServerSnapshot: (): S => bloc.state,
  };
};

export default externalBlocStore;
