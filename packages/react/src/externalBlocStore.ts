import { BlocBase, BlocGeneric, InferStateFromGeneric } from 'blac';

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
  dependencyArray: (state: S) => unknown[],
): ExternalStore<B, S> => {
  let lastDependencyCheck = dependencyArray(bloc.state);

  return {
    subscribe: (listener: () => void) => {
      const unSub = bloc.addSubscriber((data) => {
        try {
          const newDependencyCheck = dependencyArray(data) ?? [];

          let allEqual = true;
          for (let i = 0; i < newDependencyCheck.length; i++) {
            if (newDependencyCheck[i] !== lastDependencyCheck[i]) {
              allEqual = false;
              break;
            }
          }

          if (!allEqual) {
            lastDependencyCheck = newDependencyCheck;
            listener();
          }
        } catch (e) {
          console.error({
            e,
            bloc,
            dependencyArray,
            lastDependencyCheck,
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
