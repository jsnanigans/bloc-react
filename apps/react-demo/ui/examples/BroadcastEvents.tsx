import type { FC } from 'react';
import React from 'react';
import { Blac, Cubit } from 'blac';
import { useBloc } from '@blac/react';
import BlacEvent from 'blac/src/BlacEvent';

class EventListenerBloc extends Cubit<string[]> {
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

const EventDemo: FC = () => {
  const [signals] = useBloc(EventListenerBloc);

  const sendSignal = (signalName: string, data) => {
    Blac.dispatchEvent(new BlacEvent(signalName, { detail: data }));
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

export default EventDemo;
