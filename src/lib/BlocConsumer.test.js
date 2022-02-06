import { BlocConsumer } from "./BlocConsumer";
import BlocObserver from "./BlocObserver";
import { AuthEvent, ChangeListener, Test1, TestBloc, ValueChangeListener } from "../helpers/test.fixtures";
describe("BlocConsumer", function () {
    it("should call `onChange` on any state change", function () {
        var testCubit = new Test1();
        var testBlocConsumer = new BlocConsumer([testCubit]);
        var onChange = jest.fn();
        testBlocConsumer.observer = new BlocObserver({ onChange: onChange });
        testCubit.increment();
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(testCubit, { currentState: 1, nextState: 2 });
    });
    it("should call `onTransition` on any state change for Blocs", function () {
        var testBloc = new TestBloc();
        var testBlocConsumer = new BlocConsumer([testBloc]);
        var onTransition = jest.fn();
        testBlocConsumer.observer = new BlocObserver({ onTransition: onTransition });
        testBloc.add(AuthEvent.authenticated);
        expect(onTransition).toHaveBeenCalledTimes(1);
        expect(onTransition).toHaveBeenCalledWith(testBloc, {
            currentState: false,
            event: AuthEvent.authenticated,
            nextState: true
        });
    });
    it("should call `onRegister` when the class is registered", function () {
        var register = jest.fn();
        var testCubit = new Test1({
            register: register
        });
        new BlocConsumer([testCubit]);
        expect(register).toHaveBeenCalledTimes(1);
    });
    it("should call register method when local bloc is added", function () {
        var notify = jest.fn();
        var consumer = new BlocConsumer([]);
        var bloc = new TestBloc();
        bloc.addRegisterListener(notify);
        consumer.addLocalBloc({ bloc: bloc, id: '20' });
        expect(notify).toHaveBeenCalledTimes(1);
    });
    it("should not emit transition event when closed", function () {
        var notify = jest.fn();
        var bloc = new TestBloc();
        var consumer = new BlocConsumer([]);
        consumer.addLocalBloc({ bloc: bloc, id: '909' });
        consumer.observer.onTransition = notify;
        bloc.add(AuthEvent.authenticated);
        consumer.removeLocalBloc('909', bloc);
        bloc.add(AuthEvent.unauthenticated);
        expect(notify).toHaveBeenCalledTimes(1);
    });
    it("should do nothing when removing a bloc where no ID matches", function () {
        var notify = jest.fn();
        var bloc = new TestBloc();
        var consumer = new BlocConsumer([]);
        consumer.addLocalBloc({ bloc: bloc, id: '909' });
        consumer.observer.onTransition = notify;
        bloc.add(AuthEvent.authenticated);
        consumer.removeLocalBloc('1000', bloc);
        bloc.add(AuthEvent.unauthenticated);
        expect(notify).toHaveBeenCalledTimes(2);
    });
    describe("ChangeListener", function () {
        it("should allow one bloc to listen to another bloc", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ChangeListener(notify, Test1);
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' });
            expect(notify).toHaveBeenCalledTimes(0);
            global.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global, { currentState: 1, nextState: 2 });
            local.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(2);
        });
        it("should allow filtering listener only for local blocs", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ChangeListener(notify, Test1, "local");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should trigger listener "local"
            global.increment(); // should not trigger listener "local"
            expect(notify).toHaveBeenCalledTimes(0);
            local.increment(); // should trigger listener "local"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(local, { currentState: 1, nextState: 2 });
        });
        it("should allow filtering listener only for global blocs", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ChangeListener(notify, Test1, "global");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should not trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(0);
            global.increment(); // should trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global, { currentState: 1, nextState: 2 });
            local.increment(); // should not trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(1);
        });
        it("should allow not notify changes after bloc has been removed", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ChangeListener(notify, Test1, "all");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should trigger listener "all"
            global.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global, { currentState: 1, nextState: 2 });
            consumer.removeLocalBloc('909', local);
            local.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
        });
    });
    describe("ValueChangeListener", function () {
        it("should allow one bloc to listen to another bloc", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ValueChangeListener(notify, Test1);
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' });
            expect(notify).toHaveBeenCalledTimes(0);
            global.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global);
            local.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(2);
            expect(notify).toHaveBeenCalledWith(local);
        });
        it("should allow filtering listener only for local blocs", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ValueChangeListener(notify, Test1, "local");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should trigger listener "local"
            global.increment(); // should not trigger listener "local"
            expect(notify).toHaveBeenCalledTimes(0);
            local.increment(); // should trigger listener "local"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(local);
        });
        it("should allow filtering listener only for global blocs", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ValueChangeListener(notify, Test1, "global");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should not trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(0);
            global.increment(); // should trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global);
            local.increment(); // should not trigger listener "global"
            expect(notify).toHaveBeenCalledTimes(1);
        });
        it("should not notify changes after bloc has been removed", function () {
            var notify = jest.fn();
            var global = new Test1();
            var local = new Test1();
            var listener = new ValueChangeListener(notify, Test1, "all");
            var consumer = new BlocConsumer([global, listener]);
            consumer.addLocalBloc({ bloc: local, id: '909' }); // should trigger listener "all"
            global.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
            expect(notify).toHaveBeenCalledWith(global);
            consumer.removeLocalBloc('909', local);
            local.increment(); // should trigger listener "all"
            expect(notify).toHaveBeenCalledTimes(1);
        });
    });
    describe("getLocalBlocForProvider", function () {
        it("should return bloc that matches id and type", function () {
            var one = new Test1();
            var consumer = new BlocConsumer([]);
            consumer.addLocalBloc({ bloc: one, id: '909' });
            expect(consumer.getLocalBlocForProvider('909', Test1)).toBe(one);
        });
        it("should not return bloc after it hase been removed", function () {
            var one = new Test1();
            var consumer = new BlocConsumer([]);
            consumer.addLocalBloc({ bloc: one, id: '909' });
            expect(consumer.getLocalBlocForProvider('909', Test1)).toBe(one);
            consumer.removeLocalBloc('909', one);
            expect(consumer.getLocalBlocForProvider('909', Test1)).toBeUndefined();
        });
        it("should find matching type in tree if id matches but not the type", function () {
            var one = new Test1();
            var two = new TestBloc();
            var consumer = new BlocConsumer([]);
            consumer.addLocalBloc({ bloc: one, id: '909' });
            consumer.addLocalBloc({ bloc: two, id: '192', parent: '909' });
            consumer.addLocalBloc({ bloc: two, id: '5', parent: '192' });
            expect(consumer.getLocalBlocForProvider('5', Test1)).toBe(one);
            consumer.removeLocalBloc('909', one);
            expect(consumer.getLocalBlocForProvider('5', Test1)).toBeUndefined();
        });
        it("should return undefined if item cannot be found in tree", function () {
            var two = new TestBloc();
            var consumer = new BlocConsumer([]);
            consumer.addLocalBloc({ bloc: two, id: '909' });
            consumer.addLocalBloc({ bloc: two, id: '192', parent: '909' });
            consumer.addLocalBloc({ bloc: two, id: '5', parent: '192' });
            expect(consumer.getLocalBlocForProvider('5', Test1)).toBeUndefined();
        });
    });
    describe("getGlobalBloc", function () {
        it("should bloc from global state", function () {
            var bloc = new Test1();
            var consumer = new BlocConsumer([bloc]);
            var out = consumer.getGlobalBloc(Test1);
            expect(out instanceof Test1).toBe(true);
        });
        it("should return undefined if mocksEnabled is enabled and bloc is not found", function () {
            var bloc = new Test1();
            var consumer = new BlocConsumer([]);
            consumer.mocksEnabled = true;
            consumer.addBlocMock(bloc);
            var out = consumer.getGlobalBloc(TestBloc);
            expect(out).toBeUndefined();
        });
    });
    describe("addBlocMock", function () {
        it("should add bloc if mocksEnabled is enabled", function () {
            var bloc = new Test1();
            var consumer = new BlocConsumer([]);
            consumer.mocksEnabled = true;
            consumer.addBlocMock(bloc);
            var out = consumer.getGlobalBloc(Test1);
            expect(out).toBe(bloc);
        });
        it("should not add bloc if mocksEnabled is enabled", function () {
            var bloc = new Test1();
            var consumer = new BlocConsumer([]);
            consumer.mocksEnabled = false;
            consumer.addBlocMock(bloc);
            var out = consumer.getGlobalBloc(Test1);
            expect(out).toBeUndefined();
        });
    });
});
