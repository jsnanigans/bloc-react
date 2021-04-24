import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { nanoid } from "nanoid";
import BlocBase from "../blocBase";

interface BlocLordOptions {
  /** Enables debugging which calls BlocReact.observer every time a Subject is updated. Defaults to false */
  debug?: boolean;
}

type ValueType<T extends BlocBase<any>> = T extends BlocBase<infer U>
  ? U
  : never;

type BlocHookData<T extends BlocBase<any>> = [
  value: ValueType<T>,
  instance: T,
  stream: {
    // stream: BehaviorSubject<T>;
    error: any;
    complete: boolean;
  }
];

interface BlocHookOptions<T extends BlocBase<any>> {
  subscribe?: boolean;
  shouldUpdate?: (previousState: ValueType<T>, state: ValueType<T>) => boolean;
}

const defaultBlocHookOptions: BlocHookOptions<any> = {
  subscribe: true
};

class BlocRuntimeError {
  error: Error;

  constructor(message?: string) {
    this.error = new Error(message);
  }
}

export class BlocReact {
  observer: null | ((bloc: BlocBase<any>, value: any) => void) = null;
  debug: boolean;
  private readonly _blocListGlobal: BlocBase<any>[];
  private readonly _contextGlobal: React.Context<BlocBase<any>[]>;
  private _contextLocalProviderKey = React.createContext("");

  private _blocMapLocal: Record<string, BlocBase<any>> = {};

  // private _contextMapLocal: Record<string, React.Context<Cubit<any>>> = {}

  constructor(blocs: BlocBase<any>[], options: BlocLordOptions = {}) {
    this._blocListGlobal = blocs;
    this._contextGlobal = React.createContext(blocs);
    this.debug = options.debug || false;

    if (this.debug) {
      for (const b of blocs) {
        b.subject.subscribe((v: any) => this.notify(b, v));
      }
    }
  }

  notify(bloc: BlocBase<ValueType<any>>, value: ValueType<any>): void {
    if (this.observer) {
      this.observer(bloc, value);
    }
  }

  useBloc = <T extends BlocBase<any>>(
    blocClass: new (...args: never[]) => T,
    options: BlocHookOptions<T> = {}
  ): BlocHookData<T> => {
    const mergedOptions: BlocHookOptions<T> = {
      ...defaultBlocHookOptions,
      ...options
    };

    const localProviderKey = useContext(this._contextLocalProviderKey);
    const localBlocInstance = this._blocMapLocal[localProviderKey];

    const { subscribe, shouldUpdate = true } = mergedOptions;
    const blocs = useContext(this._contextGlobal);
    const blocInstance =
      localBlocInstance || blocs.find((c) => c instanceof blocClass);

    if (!blocInstance) {
      const name = blocClass.prototype.constructor.name;
      const error = new BlocRuntimeError(`"${name}" 
      no bloc with this name was found in the global context.
      
      # Solutions:
      
      1. Wrap your code in a BlocProvider.
      
      2. Add "${name}" to the "BlocReact" constructor:
        const state = new BlocReact(
          [
            ...
            new ${name}(),
          ]
        )
        
      and mame sure you add the global state provider to your app:
        const { GlobalBlocProvider } = state;
        ...
        <GlobalBlocProvider>
          <App />
        </GlobalBlocProvider>
      `);
      console.error(error.error);
      return [(e: null) => e, {}, {
        error,
        complete: true
      }] as unknown as BlocHookData<T>;
    }

    const [data, setData] = useState(blocInstance.getValue());
    const [error, setError] = useState();
    const [complete, setComplete] = useState(false);

    const updateData = useCallback((newState: ValueType<T>) => {
      if (shouldUpdate === true || shouldUpdate(data, newState)) {
        setData(newState);
      }
    }, []);

    useEffect(() => {
      if (subscribe) {
        const subscription = blocInstance.subscribe(
          updateData,
          setError,
          () => setComplete(true)
        );
        return () => subscription.unsubscribe();
      }
    }, [this._contextGlobal]);

    return [
      data,
      blocInstance as T,
      {
        error,
        complete
      }
    ];
  };

  // Components
  BlocBuilder = <T extends BlocBase<any>>(props: {
    bloc: new (...args: never[]) => T;
    builder: (data: BlocHookData<T>) => ReactElement;
    shouldUpdate?: (
      previousState: ValueType<T>,
      state: ValueType<T>
    ) => boolean;
  }): ReactElement | null => {
    const hook = this.useBloc(props.bloc, {
      shouldUpdate: props.shouldUpdate
    });
    return props.builder(hook);
  };

  GlobalBlocProvider = (props: {
    children?: ReactElement | ReactElement[];
  }): ReactElement => {
    return (
      <this._contextGlobal.Provider value={this._blocListGlobal}>
        {props.children}
      </this._contextGlobal.Provider>
    );
  };

  BlocProvider = <T extends BlocBase<any>>(props: {
    children?: ReactElement | ReactElement[];
    create: (providerKey: string) => T;
  }): ReactElement => {
    const providerKey = useMemo<string>(() => "p_" + nanoid(), []);

    const bloc = useMemo<T>(() => {
      const newBloc = props.create(providerKey);
      newBloc._localProviderRef = providerKey;
      this._blocMapLocal[providerKey] = newBloc;

      if (this.debug) {
        newBloc.subject.subscribe((v: any) => this.notify(newBloc, v));
      }

      return newBloc;
    }, []);

    const context = useMemo<React.Context<BlocBase<any>>>(() => {
      return React.createContext<BlocBase<any>>(bloc);
      // this._contextMapLocal[providerKey] = newContext;
    }, [bloc]);

    useEffect(() => {
      return () => {
        bloc.subject.complete();
        delete this._blocMapLocal[providerKey];
      };
    }, []);

    return (
      <this._contextLocalProviderKey.Provider value={providerKey}>
        <context.Provider value={bloc}>{props.children}</context.Provider>
      </this._contextLocalProviderKey.Provider>
    );
  };
}
