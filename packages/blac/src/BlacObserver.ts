import { BlocHookDependencyArrayFn } from './types';

export type BlacObserver<S> = {
  fn: (newState: S, oldState: S, action?: any) => void | Promise<void>;
  dependencyArray?: BlocHookDependencyArrayFn<any>;
};

export class BlacObservable<S> {
  private _observers = new Set<BlacObserver<S>>();

  get size(): number {
    return this._observers.size;
  }

  get observers() {
    return this._observers;
  }

  subscribe(observer: BlacObserver<S>): () => void {
    this._observers.add(observer);
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer: BlacObserver<S>) {
    this._observers.delete(observer);
  }

  notify(newState: S, oldState: S, action?: any) {
    this._observers.forEach((observer) => {
      let shouldUpdate = false;

      if (observer.dependencyArray) {
        const lastDependencyCheck = observer.dependencyArray(
          oldState,
          oldState,
        );
        const newDependencyCheck = observer.dependencyArray(newState, oldState);

        for (let i = 0; i < newDependencyCheck.length; i++) {
          if (newDependencyCheck[i] !== lastDependencyCheck[i]) {
            shouldUpdate = true;
            break;
          }
        }
      } else {
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        return observer.fn(newState, oldState, action);
      }
    });
  }

  dispose() {
    this._observers.clear();
  }
}
