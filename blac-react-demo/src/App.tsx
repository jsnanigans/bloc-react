import Counter from './components/Counter.tsx';
import CounterIsolated from './components/CounterIsolated.tsx';

function App() {
  return (
    <main>
      <div>
        <h1>Counter</h1>
        <Counter />
      </div>
      <div>
        <h2>Shared State</h2>
        <Counter />
        <Counter />
        <Counter />
        <Counter />
        <Counter />
      </div>
      <div>
        <h2>Isolated Counters</h2>
        <CounterIsolated />
        <CounterIsolated />
        <CounterIsolated />
        <CounterIsolated />
        <CounterIsolated />
      </div>
    </main>
  );
}

export default App;
