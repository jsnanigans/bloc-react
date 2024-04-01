import type { FC } from 'react';
import React, { useCallback } from 'react';
import { Bloc, Cubit } from 'blac';
import { useBloc } from '@blac/react';

class TodoListBloc extends Cubit<string[]> {
  userBloc = this.blac.getBloc(UserBloc);

  constructor() {
    super(['Learn about BLoC pattern', 'Learn about Cubit pattern']);
    this.userBloc = this.blac.getBloc(UserBloc);
  }

  addTodo = (text: string) => {
    this.emit([...this.state, text]);
  };

  get todosWithName() {
    return this.state.map((todo) => `${this.userBloc.state} - ${todo}`);
  }
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
  const [, { addTodo, todosWithName }] = useBloc(TodoListBloc);
  const [name, { setName }] = useBloc(UserBloc);

  const handleAddTodo = useCallback(
    (event) => {
      event.preventDefault();
      const text = event.target.text.value;
      if (!text) return;
      addTodo(text);
    },
    [addTodo],
  );

  return (
    <>
      <table>
        <tbody>
          {todosWithName.map((todo, index) => (
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
