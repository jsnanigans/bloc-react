import { BlocBase } from './BlocBase';
import { BlacLifecycleEvent, EventParams } from './Blac';

export interface BlacPlugin {
  name: string;

  onEvent<B extends BlacLifecycleEvent>(
    event: B,
    bloc: BlocBase<any>,
    params?: EventParams[B],
  ): void;
}
