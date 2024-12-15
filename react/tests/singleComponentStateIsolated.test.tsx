import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cubit } from '@blac/core';
import React, { FC } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { useBloc } from '@blac/react';

class CounterCubit extends Cubit<
  { count: number; name: string },
  { initialState?: number }
> {
  static isolated = true;
  constructor(props: { initialState?: number } = {}) {
    super({
      count: props.initialState ?? 0,
      name: 'John Doe',
    });
  }

  increment = () => this.patch({ count: this.state.count + 1 });
  updateName = (name: string) => this.patch({ name });
}

let renderCount = 0;
const Counter: FC<{ num: number }> = ({ num }) => {
  const [{ count }, { increment, updateName }] = useBloc(CounterCubit, {
    props: { initialState: num },
  });
  renderCount++;
  return (
    <div>
      <button onClick={increment}>+1</button>
      <button onClick={() => updateName('new name')}>updateName</button>
      <label>{count}</label>
    </div>
  );
};

beforeEach(() => {
  renderCount = 0;
});

test('should get state and instance', () => {
  render(<Counter num={3442} />);
  expect(screen.getByText('3442')).toBeInTheDocument();
});

test('should update state', async () => {
  render(<Counter num={3442} />);
  const instance = screen.getByText('3442');
  expect(instance).toBeInTheDocument();
  await userEvent.click(screen.getByText('+1'));
  expect(instance).toHaveTextContent('3443');
  await userEvent.click(screen.getByText('+1'));
  expect(instance).toHaveTextContent('3444');
});

test('should rerender when state changes', async () => {
  render(<Counter num={3442} />);
  const instance = screen.getByText('3442');
  expect(instance).toBeInTheDocument();
  expect(renderCount).toBe(1);
  await userEvent.click(screen.getByText('+1'));
  expect(screen.getByText('3443')).toBeInTheDocument();
  expect(renderCount).toBe(3);
});

test('should not rerender when state changes that is not used', async () => {
  render(<Counter num={3442} />);
  const instance = screen.getByText('3442');
  expect(instance).toBeInTheDocument();
  expect(renderCount).toBe(1);
  await userEvent.click(screen.getByText('+1'));
  expect(renderCount).toBe(3);
  await userEvent.click(screen.getByText('updateName'));
  expect(renderCount).toBe(3);
  await userEvent.click(screen.getByText('updateName'));
  expect(renderCount).toBe(3);
  await userEvent.click(screen.getByText('+1'));
  expect(renderCount).toBe(4);
});
