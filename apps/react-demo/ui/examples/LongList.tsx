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

class LongListBloc extends Cubit<ListItem[]> {
  constructor() {
    super([]);
  }

  populate = () => {
    const newList: ListItem[] = [];
    for (let i = 0; i < 20; i++) {
      const id =
        Math.random().toString().replace('0.', '') + Date.now().toString();
      const item = {
        name: `Item ${id.substring(0, 5)}`,
        date: new Date(),
        id,
        done: false,
      };

      newList.push(item);
    }

    this.emit(newList);
  };

  toggleDone = (id: string) => {
    const newState = this.state.map((item) => {
      if (item.id === id) {
        return { ...item, done: !item.done };
      }
      return item;
    });
    this.emit(newState);
  };
}

const Item: React.FC<{ index: number }> = ({ index }) => {
  const [all, { toggleDone }] = useBloc(LongListBloc, {
    inferStateUsage: true,
  });

  const item = all[index];

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
      return [all.length];
    },
  });

  return (
    <div>
      <button onClick={populate}>Populate</button>
      <div>
        <ul>
          <li>List: {all.length}</li>
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
            {all.map((item, index) => (
              <Item key={item.id} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LongList;
