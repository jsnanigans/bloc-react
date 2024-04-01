import { Bloc } from 'blac';

export type CounterState = {
  count: number;
};

export enum CounterAction {
  increment = 'inc',
  decrement = 'dec',
}

export default class CounterBloc extends Bloc<CounterState, CounterAction> {
  constructor() {
    super({ count: 0 });
  }

  reducer(action: CounterAction, state: CounterState): CounterState {
    switch (action) {
      case CounterAction.increment:
        state.count += 1;
        return { ...state };
      case CounterAction.decrement:
        state.count -= 1;
        return { ...state };
    }
    return { ...state };
  }
}
