import { BlocBase } from '../BlocBase';

export type BlacAddonInit = (
  bloc: BlocBase<any>,
  // bloc: Cubit<unknown> | Bloc<unknown, unknown>,
) => void;

export type BlacAddonEmit = (params: {
  oldState: unknown;
  newState: unknown;
  // cubit: Cubit<unknown> | Bloc<unknown, unknown>;
  cubit: BlocBase<any>;
}) => void;

type BlacAddon = {
  name: string;
  onInit?: BlacAddonInit;
  onEmit?: BlacAddonEmit;
};

export default BlacAddon;
