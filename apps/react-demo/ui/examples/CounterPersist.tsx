import { Bloc, Cubit, Persist } from 'blac';
import React, { FC } from 'react';
import { useBloc } from '@blac/react';

// Cubit with persist addon
class CounterPersistCubit extends Cubit<number> {
  static addons = [
    Persist({
      defaultValue: 0,
    }),
  ];

  update = (amount: number) => this.emit(this.state + amount);
}

// Bloc with persist addon
enum CounterPersistActions {
  increment = 'increment',
  decrement = 'decrement',
}
class CounterPersistBloc extends Bloc<number, CounterPersistActions> {
  static addons = [
    Persist({
      defaultValue: 0,
      storageType: 'sessionStorage',
    }),
  ];

  reducer(action: CounterPersistActions, state: number) {
    switch (action) {
      case CounterPersistActions.increment:
        return state + 1;
      case CounterPersistActions.decrement:
        return state - 1;
      default:
        return state;
    }
  }
}

// Component
const CounterWithCubitPersist: FC = () => {
  const [count, { update }] = useBloc(CounterPersistCubit);
  const [count2, bloc] = useBloc(CounterPersistBloc);

  return (
    <>
      <h4>LocalStorage</h4>
      <button onClick={() => update(-1)}>-</button>
      {` ${count} `}
      <button onClick={() => update(1)}>+</button>
      <hr />
      <h4>SessionStorage</h4>
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
