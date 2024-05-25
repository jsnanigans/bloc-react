export default class BlacEvent<T> extends CustomEvent<T> {
  constructor(type: string, eventInitDict?: CustomEventInit<T> | undefined) {
    super(type, eventInitDict);
  }
}
