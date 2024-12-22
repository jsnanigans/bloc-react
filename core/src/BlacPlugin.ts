import type { BlocBase } from './BlocBase.ts';
import type { BlacLifecycleEvent } from './Blac.ts';

export interface BlacPlugin {
  name: string;

  onEvent<B extends BlacLifecycleEvent>(
    event: B,
    bloc: BlocBase<any>,
    params?: any,
  ): void;
}
