import { useBloc } from '@blac/react';
import { Cubit } from '@blac/core';

class CounterBloc extends Cubit<{ count: number }> {
  static override isolated = true;
  constructor() {
    super({ count: 0 });
  }

  increment = () => {
    this.emit({ count: this.state.count + 1 });
  };
}

function CounterIsolated() {
  const [{ count }, { increment }] = useBloc(CounterBloc);
  return (
    <button
      className="border px-3 py-1 w-16 hover:bg-gray-50"
      onClick={increment}
    >
      {count}
    </button>
  );
}

export default CounterIsolated;
