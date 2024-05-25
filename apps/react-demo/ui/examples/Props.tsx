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
}

const Props: FC<{ name: string }> = ({ name }) => {
  // pass the props to the bloc
  const [{ display }] = useBloc(PropsBloc, {
    props: {
      name,
    },
  });

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
