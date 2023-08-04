import { BlocBase, ValueType } from "blac";

export interface ExternalStore<B extends BlocBase<any>> {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => ValueType<B>;
  getServerSnapshot?: () => ValueType<B>;
}

const externalBlocStore = <B extends BlocBase<any>>(
  bloc: B,
  dependency: (state: ValueType<B>) => unknown
): ExternalStore<B> => {
  let lastDependencyCheck = dependency(bloc.state);
  return {
    subscribe: (listener: () => void) => {
      const unSub = bloc.onStateChange(data => {
        const newDependencyCheck = dependency(data);
        if (newDependencyCheck !== lastDependencyCheck) {
          lastDependencyCheck = newDependencyCheck;
          listener();
        }
      });
      return () => {
        unSub();
      };
    },
    getSnapshot: (): ValueType<B> => bloc.state
  };
};

export default externalBlocStore;
