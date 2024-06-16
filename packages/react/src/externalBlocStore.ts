import { BlocGeneric, InferStateFromGeneric } from 'blac';
import { BlocHookDependencyArrayFn } from './useBloc';

export interface ExternalStore<
  B extends BlocGeneric<any, any>,
  S extends InferStateFromGeneric<B>,
> {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => S;
  getServerSnapshot?: () => S;
}

const externalBlocStore = <
  B extends BlocGeneric<any, any>,
  S extends InferStateFromGeneric<B>,
>(
  bloc: B,
  dependencyArray: BlocHookDependencyArrayFn<InstanceType<any>>,
): ExternalStore<B, S> => {
  return {
    subscribe: (listener: (state: S) => void) => {
      const unSub = bloc.addSubscriber((data) => {
        try {
          const lastDependencyCheck = dependencyArray(
            bloc._oldState,
            bloc._oldState,
          );
          const newDependencyCheck = dependencyArray(
            bloc.state,
            bloc._oldState,
          );

          let allEqual = true;
          for (let i = 0; i < newDependencyCheck.length; i++) {
            if (newDependencyCheck[i] !== lastDependencyCheck[i]) {
              allEqual = false;
              break;
            }
          }

          if (!allEqual) {
            listener(bloc.state);
          }
        } catch (e) {
          console.error({
            e,
            bloc,
            dependencyArray,
          });
        }
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
