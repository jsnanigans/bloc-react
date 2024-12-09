import { createFileRoute } from '@tanstack/react-router';
import Counter from '../../components/Counter';
import CounterIsolated from '../../components/CounterIsolated';

export const Route = createFileRoute('/demo/counter')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-2">
      <h1 className="font-semibold my-2 text-2xl">Counter</h1>
      <Counter />
      <hr className="my-4" />
      <h2 className="font-semibold my-2 text-lg">Shared State</h2>
      <Counter />
      <Counter />
      <Counter />
      <Counter />
      <Counter />
      <hr className="my-4" />
      <h2 className="font-semibold my-2 text-lg">Isolated Counters</h2>
      <CounterIsolated />
      <CounterIsolated />
      <CounterIsolated />
      <CounterIsolated />
      <CounterIsolated />
    </div>
  );
}
