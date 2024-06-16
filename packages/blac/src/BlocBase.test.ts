import { beforeEach, describe, expect, it, vi, test } from 'vitest';
import { BlocBase } from './BlocBase';
import { Blac, BlacLifecycleEvent } from './Blac';
import { BlacPlugin } from './BlacPlugin';
import { BlacObserver } from './BlacObserver';

class BlocBaseSimple extends BlocBase<unknown> {}
class BlocBaseSimpleIsolated extends BlocBase<unknown> {
  static isolated = true;
}

describe('BlocBase', () => {
  describe('constructor', () => {
    it('should create a new observable', () => {
      const instance = new BlocBaseSimple(0);
      expect(instance.observer).toBeDefined();
    });

    it('should set initial state', () => {
      const initial = {
        a: 2,
      };
      const instance = new BlocBaseSimple(initial);
      expect(instance._state).toStrictEqual(initial);
    });

    it('should report the `bloc_created` event', () => {
      const blac = Blac.getInstance();
      const spy = vi.fn();
      const blacPlugin = {
        name: 'test',
        onEvent: (e: BlacLifecycleEvent) => spy(e),
      };
      blac.addPlugin(blacPlugin as BlacPlugin);
      new BlocBaseSimple(0);
      expect(spy).toHaveBeenCalledWith(BlacLifecycleEvent.BLOC_CREATED);
    });

    it('should set the `id` to the constructors name', () => {
      const instance = new BlocBaseSimple(0);
      expect(instance.id).toBe('BlocBaseSimple');
    });

    it('should set local prop `isolated` to whatever the static prop was set to when constructed', () => {
      const instance = new BlocBaseSimple(0);
      expect(instance.isolated).toBe(false);
      const instance2 = new BlocBaseSimpleIsolated(0);
      expect(instance2.isolated).toBe(true);
    });
  });

  describe('updateId', () => {
    it('should update the id', () => {
      const instance = new BlocBaseSimple(0);
      expect(instance.id).toBe('BlocBaseSimple');

      instance.updateId('new-id');
      expect(instance.id).toBe('new-id');
    });
  });

  describe('addSubscriber', () => {
    it('should report `listener_added` when a listener is added', () => {
      const instance = new BlocBaseSimple(0);
      const blac = instance.blac;
      const blacSpy = vi.spyOn(blac, 'report');

      instance.addSubscriber({fn: () => {}});
      expect(blacSpy).toHaveBeenNthCalledWith(
        1,
        BlacLifecycleEvent.LISTENER_ADDED,
        instance,
      );
    });

    it('should add a subscriber to the observer', () => {
      const instance = new BlocBaseSimple(0);
      const observer = instance.observer;
      const observerSpy = vi.spyOn(observer, 'subscribe');
      expect(observerSpy).not.toHaveBeenCalled();
      const callback = { fn: () => {} } as BlacObserver<any>;
      instance.addSubscriber(callback);
      expect(observerSpy).toHaveBeenCalledWith(callback);
    });

    it('should return the method that unsubscribes the listener', async () => {
      const instance = new BlocBaseSimple(0);
      const observer = instance.observer;
      const observerSpy = vi.spyOn(observer, 'unsubscribe');
      expect(observerSpy).not.toHaveBeenCalled();
      const callback = { fn: () => {} };
      const unsubscribe = instance.addSubscriber(callback);
      expect(observerSpy).not.toHaveBeenCalled();

      unsubscribe();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(observerSpy).toHaveBeenCalledWith(callback);
    });
  });

  describe('handleUnsubscribe', () => {
    it('should report `listener_removed` when a listener is removed', () => {
      const instance = new BlocBaseSimple(0);
      const blac = instance.blac;
      const blacSpy = vi.spyOn(blac, 'report');
      const callback = { fn: () => {} };
      instance.addSubscriber(callback);
      expect(blacSpy).toHaveBeenCalledWith(
        BlacLifecycleEvent.LISTENER_ADDED,
        instance,
      );
    });
  });

  describe('dispose', () => {
    it('should report `bloc_disposed` when disposed', () => {
      const instance = new BlocBaseSimple(0);
      const blac = instance.blac;
      const blacSpy = vi.spyOn(blac, 'report');
      instance.dispose();
      expect(blacSpy).toHaveBeenCalledWith(
        BlacLifecycleEvent.BLOC_DISPOSED,
        instance,
      );
    });
  });

  describe('getters', () => {
    describe('name', () => {
      it('should return the name of the constructor', () => {
        const instance = new BlocBaseSimple(0);
        expect(instance.name).toBe('BlocBaseSimple');
      });
    });

    describe('state', () => {
      it('should return the current state', () => {
        const instance = new BlocBaseSimple(0);
        expect(instance.state).toBe(0);
      });
    });

    describe('blac', () => {
      it('should be the same instance as the global Blac instance', () => {
        const instance = new BlocBaseSimple(0);
        const blac = instance.blac;
        const globalBlac = Blac.getInstance();
        expect(blac).toBe(globalBlac);
      });
    });
  });
});
