import { Route } from './Route';
import { isDefined, isFunction } from './util';
import { Activator } from './Activator';

export interface CanActivate {
    canActivate(route: Route, next: Function): void;
}

export interface CanDeactivate {
    canDeactivate(activeComponents: any, route: Route, next: Function): void;
}

function runQueue(queue: Array<Function>, guard: Function, callback: Function): void {
    let index = 0,
        length = queue.length;

    function next(fn) {
        guard(fn, (canContinue) => {
            if (canContinue) {
                index++;
                if (index < length) { next(queue[index]); }
                else { callback(true); }
            }
            else { callback(false);  /*canceled*/ }
        });
    }

    if (length > 0) { next(queue[index]); }
    else { callback(true); }
}

function getHooks(activator: Activator, type: string, route: Route): Array<any> {
    let result = [];
    if (isDefined(route.matched) && route.matched[type]) {
        // type: canActivate or canDeactivate
        route.matched[type].forEach((hook) => {
            let instance = activator.getInstance(hook);
            if (!isFunction(instance[type])) { throw new Error('Invalid hook type'); }
            result.push(instance[type]);
        });
    }
    return result;
}

export class Guard {
    _activator: Activator;
    constructor() {
        this._activator = new Activator();
    }

    checkCanDeactivate(from: Route, to: Route, activeComponents: any, next: Function): void {
        let hooks = getHooks(this._activator, 'canDeactivate', from);
        if (hooks.length > 0) {
            runQueue(hooks, (hook, canDeactivate) => {
                hook.call(hook, activeComponents, to, canDeactivate);
            }, next);
        }
        else { next(true); }
    }

    checkCanActivate(to: Route, next: Function): void {
        let hooks = getHooks(this._activator, 'canActivate', to);
        if (hooks.length > 0) {
            runQueue(hooks, (hook, canActivate) => {
                hook.call(hook, to, canActivate);
            }, next);
        }
        else { next(true); }
    }

    approve(from: Route, to: Route, activeComponents: any, next: Function): void {
        this.checkCanDeactivate(from, to, activeComponents, (canDeactivate) => {
            if (canDeactivate) {
                this.checkCanActivate(to, next);
            }
            else { next(false); }
        });
    }
}
