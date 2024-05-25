import { ConstructorDeclaration } from 'typescript';
import { Bloc } from './Bloc';
import { BlocBase } from './BlocBase';
import { Cubit } from './Cubit';

export type BlocClassNoParams<B> = new (args: never[]) => B;
// export type BlocConstructor<T> = typeof BlocBase<T>["constructor"];
export type BlocBaseAbstract = typeof Bloc<any, any> | typeof Cubit<any>;
export type BlocConstructor<B> = new (...args: unknown[]) => B;
export type ValueType<B extends BlocBase<any>> =
  B extends BlocBase<infer U> ? U : never;
// export type CubitPropsType<B extends BlocBase<any>> =
//   B extends Cubit<any, infer P> ? P : never;

export type BlocGeneric<S, A> = Bloc<S, A> | Cubit<S>;
export type InferStateFromGeneric<T> =
  T extends Bloc<infer S, any> ? S : T extends Cubit<infer S> ? S : never;

export type BlocConstructorParameters<B extends BlocBase<any>> =
  BlocConstructor<B> extends new (...args: infer P) => any ? P : never;
