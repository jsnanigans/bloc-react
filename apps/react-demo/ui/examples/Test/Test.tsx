import React from 'react';
import { useCallback } from 'react';
import { useBloc } from '@blac/react';
import CounterBloc, { CounterAction } from './TestBloc';

export function Counter() {
  const [{ count }, { add }] = useBloc(CounterBloc);

  const add100 = useCallback(() => {
    console.time('go');
    for (let i = 0; i < 100000; i++) {
      add(CounterAction.increment);
    }
    console.timeEnd('go');
  }, []);

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => add(CounterAction.increment)}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => add(CounterAction.decrement)}
        >
          Decrement
        </button>
        <button aria-label="Decrement value" onClick={add100}>
          ADD 100000
        </button>
      </div>
    </div>
  );
}
