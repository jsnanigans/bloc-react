import type { FC } from 'react';
import React from 'react';
import { Blac, Cubit } from 'blac';
import { useBloc } from '@blac/react';

class SignalListener extends Cubit<string[]> {
  constructor() {
    super([]);
  }

  onSignal(signal: string, payload: any) {
    this.emit([
      ...this.state,
      `${signal} | payload: ${JSON.stringify(payload)}`,
    ]);
  }
}

const SignalDemo: FC = () => {
  const [signals] = useBloc(SignalListener);

  const sendSignal = (signal: string, payload: any) => {
    Blac.broadcastSignal(signal, payload);
  };

  return (
    <>
      <button
        onClick={() => sendSignal('SIGNAL_EXAMPLE', { time: new Date() })}
      >
        Send example signal
      </button>
      <table>
        <tbody>
          {signals.map((signal, index) => (
            <tr key={index}>
              <td>{signal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SignalDemo;
