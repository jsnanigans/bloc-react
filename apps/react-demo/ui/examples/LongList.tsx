import { useBloc } from '@blac/react';
import { Cubit } from 'blac';
import React from 'react';
import { Flash } from './RerenderTest';

type ListItem = {
  name: string;
  date: Date;
  done: boolean;
  id: string;
};

class LongListBloc extends Cubit<Record<string, ListItem>> {
  size = 0;
  constructor() {
    super({});
    this.populate();
  }

  populate = () => {
    const newList: Record<string, ListItem> = {};
    for (let i = 0; i < 5000; i++) {
      const id =
        Math.random().toString().replace('0.', '') + Date.now().toString();
      const item = {
        name: `Item ${id.substring(0, 5)}`,
        date: new Date(),
        id,
        done: false,
      };

      newList[id] = item;
    }

    this.size = Object.keys(newList).length;
    this.emit({ ...newList });
  };

  toggleDone = (id: string) => {
    const item = this.state[id];
    item.done = !item.done;
    this.patch({ [id]: { ...item } });
  };
}

const Item: React.FC<{ id: string }> = ({ id }) => {
  const [all, { toggleDone }] = useBloc(LongListBloc);

  const item = all[id];

  return (
    <tr>
      <td>
        <Flash>{item.name}</Flash>
      </td>
      <td>{item.date.toLocaleString()}</td>
      <td>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => toggleDone(item.id)}
        />
      </td>
    </tr>
  );
};

const LongList = () => {
  const [all, { populate }] = useBloc(LongListBloc, {
    dependencySelector: (all) => {
      return Object.keys(all);
    },
  });

  return (
    <div>
      <button onClick={populate}>Populate</button>
      <div>
        <ul>
          <li>List: {Object.keys(all).length}</li>
        </ul>
      </div>
      <div
        style={{
          width: '100%',
          height: '500px',
          overflow: 'auto',
          border: '1px solid var(--color)',
        }}
      >
        <table style={{ width: '100%', border: '1px solid black' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Done</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(all).map((id) => (
              <Item key={id} id={id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LongList;
