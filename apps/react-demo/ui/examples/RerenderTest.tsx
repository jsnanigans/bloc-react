import { useBloc } from '@blac/react';
import { Cubit } from 'blac';
import type { ChangeEvent, FC, ReactNode } from 'react';
import React from 'react';

class DemoCubit extends Cubit<{
  name: string;
  email: string;
}> {
  constructor() {
    super({ name: 'Jann Doe', email: 'j@d.co' });
  }
  setName = (e: ChangeEvent<HTMLInputElement>) =>
    this.patch({ name: e.target.value });
  setEmail = (e: ChangeEvent<HTMLInputElement>) =>
    this.patch({ email: e.target.value });
}

// Component that renders a flashing highlight when it is re-rendered
export const Flash: FC<{ children?: ReactNode }> = ({ children }) => {
  const rndCount = React.useRef(0);
  const rnd = Math.random();

  rndCount.current += 1;

  return (
    <div className="flash">
      {children}
      <div className="highlight" key={rnd} />
      <div className="rnd">#{rndCount.current}</div>
    </div>
  );
};

// Only show the name
const ShowName: FC = () => {
  const [{ name }] = useBloc(DemoCubit, { inferStateUsage: true });
  return <Flash>Name: {name}</Flash>;
};

// Input to change the email
const ChangeName: FC = () => {
  const [{ name }, { setName }] = useBloc(DemoCubit, { inferStateUsage: true });
  return (
    <Flash>
      Name: <input type="text" value={name} onChange={setName} />
    </Flash>
  );
};

// Only show the email
const ShowEmail: FC = () => {
  const [{ email }] = useBloc(DemoCubit, { inferStateUsage: true });
  return <Flash>Email: {email}</Flash>;
};

const isEmail = (email: string) => {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return reg.test(email);
};
const ShowIsEmail: FC = () => {
  const [{ email }] = useBloc(DemoCubit, {
    dependencySelector: ({ email }) => [isEmail(email)],
  });
  return <Flash>Is Email: {isEmail(email) ? 'YES' : 'NO'}</Flash>;
};

// Input to change the email
const ChangeEmail: FC = () => {
  const [{ email }, { setEmail }] = useBloc(DemoCubit, {
    inferStateUsage: true,
  });
  return (
    <Flash>
      Email: <input type="text" value={email} onChange={setEmail} />
    </Flash>
  );
};

// Show both name and email
const ShowAll: FC = () => {
  const [showEmail, setShowEmail] = React.useState(true);
  const [showName, setShowName] = React.useState(true);
  const [state] = useBloc(DemoCubit, { inferStateUsage: true });

  return (
    <Flash>
      <ul>
        <li>Name: {showName ? state.name : <em>----</em>}</li>
        <li>Email: {showEmail ? state.email : <em>----</em>}</li>
      </ul>
      <label>
        <input
          type="checkbox"
          id="showName"
          checked={showName}
          onChange={() => setShowName(!showName)}
        />
        Show Name
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="showEmail"
          checked={showEmail}
          onChange={() => setShowEmail(!showEmail)}
        />
        Show Email
      </label>
    </Flash>
  );
};

const RerenderTest: FC = () => {
  return (
    <div>
      <ShowName />
      <ShowEmail />
      <ShowIsEmail />
      <ShowAll />
      <ChangeName />
      <ChangeEmail />
    </div>
  );
};

export default RerenderTest;
