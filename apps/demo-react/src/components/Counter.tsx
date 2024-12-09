import { useBloc } from '@blac/react';
import { Cubit } from 'blac-next';

class CounterBloc extends Cubit<{ count: number }> {
  constructor() {
    super({ count: 0 });
  }

  increment = () => {
    this.emit({ count: this.state.count + 1 });
  };
}

function Counter() {
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

export default Counter;
