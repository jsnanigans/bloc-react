import { useBloc } from '@blac/react';
import { Cubit } from 'blac';
import React, { FC } from 'react';

type PropsBlocProps = { name: string };

class PropsBloc extends Cubit<{ display: string }, PropsBlocProps> {
  // props are passed to the constructor, if the bloc is not isolated the state is shared and so the constructor is called only once for the first
  static isolated = true;
  constructor(props: PropsBlocProps) {
    super({ display: props.name });
  }

  jumbleLetters = () => {
    let newName = this.state.display;

    while (newName === this.state.display) {
      const rndOrder = this.state.display
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('')
        .toLowerCase();
      const firstCharUpper =
        rndOrder.charAt(0).toUpperCase() + rndOrder.slice(1);
      newName = firstCharUpper;
    }

    this.patch({ display: newName });
  };
}

const Props: FC<PropsBlocProps> = (props) => {
  const [{ display }, { jumbleLetters }] = useBloc(PropsBloc, {
    props,
  });

  return <button onClick={jumbleLetters}>Name: {display}</button>;
};

function PropsExample() {
  return (
    <div>
      <Props name="Benjamin" />
      <Props name="Val" />
      <Props name="Leopold" />
    </div>
  );
}

export default PropsExample;
