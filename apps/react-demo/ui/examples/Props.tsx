import { useBloc } from '@blac/react';
import { Cubit } from 'blac';
import React, { FC } from 'react';

class PropsBloc extends Cubit<{ display: string }, { name: string }> {
  // when using props, you need to set isolated to true
  // or make sure to give each instance a unique id.
  // if multiple consumers (components) share the same bloc instance,
  // and pass different props only the first one will be used.
  static isolated = true;
  constructor() {
    super({ display: '' });
    this.updateDisplay();
  }

  updateDisplay = () => {
    const { name } = this.props ?? {};
    this.emit({ display: name ?? 'nothing' });
  };
}

const Props: FC<{ name: string }> = ({ name }) => {
  // pass the props to the bloc
  const [{ display }] = useBloc(PropsBloc, { props: { name } });

  return <div>Name: {display}</div>;
};

function PropsExample() {
  return (
    <div>
      <Props name="Ben" />
      <Props name="Val" />
      <Props name="Loic" />
    </div>
  );
}

export default PropsExample;
