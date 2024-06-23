import { useBloc } from '@blac/react';
import { Bloc, Cubit } from 'blac';
import type { FC } from 'react';
import React from 'react';

class TodoListBloc extends Cubit<string[]> {
  constructor() {
    super([]);
    const name = this._blac.getBloc(UserBloc).state;
    this.emit([
      `${name}: Learn about BLoC pattern`,
      `${name}: Learn about Cubit pattern`,
    ]);
  }

  addTodo = (text: string) => {
    const name = this._blac.getBloc(UserBloc).state;
    this.emit([...this.state, `${name}: ${text}`]);
  };
}

class UserActionChangeName {
  constructor(public payload: string) {}
}

type UserActions = UserActionChangeName;

class UserBloc extends Bloc<string, UserActions> {
  constructor() {
    super('John Doe');
  }

  reducer(action: UserActions, state: string) {
    switch (action.constructor) {
      case UserActionChangeName:
        return (action as UserActionChangeName).payload;
    }
    return state;
  }

  setName = (name: string) => {
    this.add(new UserActionChangeName(name));
  };
}

const CrossDependency: FC = () => {
  const [todos, { addTodo }] = useBloc(TodoListBloc);
  const [name, { setName }] = useBloc(UserBloc);

  const handleAddTodo = (event) => {
    event.preventDefault();
    const text = event.target.text.value;
    if (!text) return;
    addTodo(text);
  };

  return (
    <>
      <table>
        <tbody>
          {todos.map((todo, index) => (
            <tr key={index}>
              <td>{todo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleAddTodo}>
        <input type="text" name="text" />
        <button type="submit">Add todo</button>
      </form>

      <hr />

      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </>
  );
};

export default CrossDependency;
