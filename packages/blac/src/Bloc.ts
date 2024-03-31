import { BlocBase } from './BlocBase';
import { BlacEvent } from './Blac';

export abstract class Bloc<S, A> extends BlocBase<S> {
  static create: () => BlocBase<any>;

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
  add = (action: A): void => {
    const oldState = this.state;
    const newState = this.reducer(action, this.state);
    this.pushState(newState, oldState);
  };
}
