import type { FC } from 'react';
import React, { useCallback } from 'react';
import { Cubit } from 'blac';
import { useBloc } from '@blac/react';

class TodoListBloc extends Cubit<string[]> {
  constructor() {
    super(['Learn about BLoC pattern', 'Learn about Cubit pattern']);
  }

  addTodo = (text: string) => {
    this.emit([...this.state, text]);
  };

  get todosWithName() {
    const name = this.blac.getBloc(UserBloc).state;
    return this.state.map((todo) => `${name} - ${todo}`);
  }
}

class UserBloc extends Cubit<string> {
  constructor() {
    super('John Doe');
  }

  setName = (name: string) => {
    this.emit(name);
  };
}

const NameForm: FC = () => {
  const [name, { setName }] = useBloc(UserBloc);

  return (
    <input
      type="text"
      name="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
};

const CrossDependency: FC = () => {
  const [, { addTodo, todosWithName }] = useBloc(TodoListBloc);

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
      <NameForm />
    </>
  );
};

export default CrossDependency;
