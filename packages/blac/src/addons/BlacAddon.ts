import { Bloc } from '../Bloc';
import { Cubit } from '../Cubit';

export type BlacAddonInit = (
  bloc: Cubit<unknown> | Bloc<unknown, unknown>,
) => void;
export type BlacAddonEmit = (params: {
  oldState: unknown;
  newState: unknown;
  cubit: Cubit<unknown> | Bloc<unknown, unknown>;
}) => void;

type BlacAddon = {
  name: string;
  onInit?: BlacAddonInit;
  onEmit?: BlacAddonEmit;
};

export default BlacAddon;
