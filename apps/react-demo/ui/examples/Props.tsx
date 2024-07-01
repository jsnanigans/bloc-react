import { useBloc } from '@blac/react';
import { Cubit } from 'blac';
import React, { FC, useEffect } from 'react';

type PropsBlocProps = { name: string; onChange: () => void };

class PropsBloc extends Cubit<{ display: string }, PropsBlocProps> {
  // props are passed to the constructor, if the bloc is not isolated the state is shared and so the constructor is called only once for the first
  static isolated = true;
  constructor(props: PropsBlocProps) {
    super({ display: props.name });
  }

  jumbleLetters = () => {
    let newName = this.state.display;

    this.props?.onChange();

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

const Props: FC<{ name: string }> = (props) => {
  const [time, setTime] = React.useState(new Date());

  const [{ display }, { jumbleLetters }] = useBloc(PropsBloc, {
    props: {
      name: props.name,
      onChange: () => {
        console.log('state changed', time);
      },
    },
  });

  const handleClick = () => {
    setTime(new Date());
  };

  useEffect(() => {
    jumbleLetters();
  }, [time]);

  return (
    <button onClick={handleClick}>
      Name: {display}. {time.toLocaleTimeString()}
    </button>
  );
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
