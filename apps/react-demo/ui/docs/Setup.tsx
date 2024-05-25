import type { FC } from 'react';
import React from 'react';

const Setup: FC = () => {
  return (
    <>
      <h3>Install</h3>

      <pre className={'read'}>$ npm install blac @blac/react</pre>

      <h3>done, see examples on how to use blac</h3>
    </>
  );
};

export default Setup;
