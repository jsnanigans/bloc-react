import { BlacLifecycleEvent } from './Blac';
import { BlocBase } from './BlocBase';

export abstract class Bloc<S, A> extends BlocBase<S> {
  static create: () => BlocBase<any>;

  constructor(state: S, props?: unknown) {
    super(state);
  }

  /**
   * The reducer is called whenever a new action is emited,
   * @param action: the action from "add"
   * @param state: the current state
   * @returns: the new state
   */
  abstract reducer(action: A, state: S): S;

  /**
   * Add a new action, the reducer should digest the action and update the state accordingly
   * @param action: action t obe sent to the reducer
   */
  add = (action: A) => {
    const oldState = this.state;
    const newState = this.reducer(action, this.state);
    this.pushState(newState, oldState, action);
  };

  addSubscriber = (
    callback: (newState: S, oldState: S, action: A) => void,
  ): (() => void) => {
    this.blac.report(BlacLifecycleEvent.LISTENER_ADDED, this);
    this.observer.subscribe(callback);
    return () => this.handleUnsubscribe(callback);
  };
}
