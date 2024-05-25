import type { FC } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Blac, Cubit } from 'blac';
import { useBloc } from '@blac/react';

class IsolatedBloc extends Cubit<{ x: number; y: number; c: string }> {
  static isolated = true;
  velocity = { x: 0, y: 0 };
  maxX = 600;
  maxY = 400;
  props: { speedX: number; speedY: number; startX: number; color: string } = {
    speedX: 0,
    speedY: 0,
    startX: 0,
    color: 'orange',
  };

  constructor(props: typeof this.props) {
    super({ x: 150, y: 100, c: 'orange' });
    this.props = props;
    this.startJumping();
    this.patch({ x: this.props?.startX ?? 0 });
  }

  startJumping = () => {
    this.velocity = {
      x: this.props?.speedX ?? 0,
      y: this.props?.speedY ?? 0,
    };
  };

  frame = () => {
    this.move(this.state.x + this.velocity.x, this.state.y + this.velocity.y);
  };

  move = (x: number, y: number) => {
    const next = { x, y, c: this.props?.color ?? 'orange' };

    if (x < 0) {
      next.x = 0;
      this.velocity.x = -this.velocity.x;
    } else if (x > this.maxX) {
      next.x = this.maxX;
      this.velocity.x = -this.velocity.x;
    }

    if (y < 0) {
      next.y = 0;
      this.velocity.y = -this.velocity.y;
    } else if (y > this.maxY) {
      next.y = this.maxY;
      this.velocity.y = -this.velocity.y;
    }

    this.patch(next);
  };
}

const Jumper: FC<{ color: string }> = (props) => {
  const [{ x, y, c }] = useBloc(IsolatedBloc, {
    props: {
      speedX: Math.random() * 5 - 2.5,
      speedY: Math.random() * 5 - 2.5,
      startX: Math.random() * 200,
      color: props.color,
    },
  });
  return (
    <div
      className="jumper"
      style={{ '--x': x + 'px', '--y': y + 'px', '--bg': c } as any}
    />
  );
};

const NoSharedState: FC = () => {
  const active = useRef(true);
  const [color, setColor] = React.useState('red');
  const animate = useCallback((blocks: IsolatedBloc[]) => {
    for (const block of blocks) {
      block.frame();
    }

    if (blocks.length === 0) {
      return;
    }

    requestAnimationFrame(() => animate(blocks));
  }, []);

  useEffect(() => {
    const blocks = Blac.getAllBlocs(IsolatedBloc);
    animate(blocks);

    return () => {
      active.current = false;
    };
  }, []);

  return (
    <div className="jumper-box">
      {Array.from({ length: 100 }).map((_, i) => (
        <Jumper key={i} color={color} />
      ))}
    </div>
  );
};

export default NoSharedState;
