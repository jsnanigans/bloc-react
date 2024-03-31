import { Bloc, Cubit, Persist } from 'blac';
import React, { FC } from 'react';
import { useBloc } from '@blac/react';

class CounterPersistCubit extends Cubit<number> {
  static addons = [
    Persist({
      defaultValue: 0,
    }),
  ];

  update = (amount: number) => () => this.emit(this.state + amount);
}

enum CounterPersistActions {
  increment = 'increment',
  decrement = 'decrement',
}

class CounterPersistBloc extends Bloc<number, CounterPersistActions> {
  static addons = [
    Persist({
      defaultValue: 0,
    }),
  ];

  reducer(action: CounterPersistActions, state: number) {
    switch (action) {
      case 'increment':
        return state + 1;
      case 'decrement':
        return state - 1;
    }
    return state;
  }
}

const CounterWithCubitPersist: FC = () => {
  const [count, cubit] = useBloc(CounterPersistCubit);
  const [count2, bloc] = useBloc(CounterPersistBloc);

  return (
    <>
      <button onClick={cubit.update(-1)}>-</button>
      {` ${count} `}
      <button onClick={cubit.update(1)}>+</button>
      <hr />
      <button onClick={() => bloc.add(CounterPersistActions.decrement)}>
        -
      </button>
      {` ${count2} `}
      <button onClick={() => bloc.add(CounterPersistActions.increment)}>
        +
      </button>
    </>
  );
};

export default CounterWithCubitPersist;
