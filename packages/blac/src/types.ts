import { ConstructorDeclaration } from 'typescript';
import { Bloc } from './Bloc';
import { BlocBase } from './BlocBase';
import { Cubit } from './Cubit';

export type BlocClassNoParams<B> = new (args: never[]) => B;
export type BlocBaseAbstract =
  | typeof Bloc<any, any, any>
  | typeof Cubit<any, any>;
export type BlocConstructor<B> = new (...args: any) => B;
export type ValueType<B extends BlocBase<any, any>> =
  B extends BlocBase<infer U, any> ? U : never;

export type BlocGeneric<S = any, A = any, P = any> =
  | Bloc<S, A, P>
  | Cubit<S, P>;
export type InferStateFromGeneric<T> =
  T extends Bloc<infer S, any, any>
    ? S
    : T extends Cubit<infer S, any>
      ? S
      : never;

export type InferPropsFromGeneric<T> =
  T extends Bloc<any, infer P, any>
    ? P
    : T extends Cubit<any, infer P>
      ? P
      : never;

export type BlocConstructorParameters<B extends BlocBase<any, any>> =
  BlocConstructor<B> extends new (...args: infer P) => any ? P : never;
