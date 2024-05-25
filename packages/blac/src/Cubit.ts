import { BlacLifecycleEvent } from './Blac';
import { BlocBase } from './BlocBase';

export abstract class Cubit<S, P> extends BlocBase<S, P> {
  static create: () => Cubit<any, any>;

  // constructor(props?: P) {
  //   super(undefined);
  //   this._props = props;
  // }

  /**
   * Update the state then will notify all observers
   * @param state: new state
   **/
  emit(state: S): void {
    if (state === this.state) {
      return;
    }

    const oldState = this.state;
    const newState = state;
    this.pushState(newState, oldState);
  }

  /**
   * Merges current state object with the parameter "state" and emits the new state
   * Warning: only works when the state is an object.
   * @param state: Partial state that should change
   **/
  patch(
    statePatch: S extends object ? Partial<S> : S,
    ignoreChangeCheck = false,
  ): void {
    let changes = false;
    if (!ignoreChangeCheck) {
      for (const key in statePatch) {
        const current = (this.state as any)[key];
        if (statePatch[key] !== current) {
          changes = true;
          break;
        }
      }
    }

    if (changes) {
      this.emit({ ...this.state, ...statePatch });
    }
  }

  addSubscriber = (
    callback: (newState: S, oldState: S) => void,
  ): (() => void) => {
    this.blac.report(BlacLifecycleEvent.LISTENER_ADDED, this);
    this.observer.subscribe(callback);
    return () => this.handleUnsubscribe(callback);
  };
}
