import { Route } from './Route';
import { isDefined, isFunction } from './util';
import { Activator } from './Activator';
import { isString } from './util/types';

export interface CanActivate {
    canActivate(route: Route, next: Function): void;
}

export interface CanDeactivate {
    canDeactivate(activeComponents: any, route: Route, next: Function): void;
}

function checkHooks(hooks: Function[], handler: Function, next: Function): void {
    let index = 0,
        length = hooks.length;

    function nextHook(fn) {
        handler(fn, (response) => {
            if (response === false || isString(response)) {
                next(response); /* cancel or redirection */
            }
            else {
                index++;
                if (index < length) { nextHook(hooks[index]); }
                else { next(true); }
            }
        });
    }

    if (length > 0) { nextHook(hooks[index]); }
    else { next(true); }
}

function getRouteHooks(type: string, route: Route, activator: Activator): Function[] {
    let hooks = [];
    if (isDefined(route.matched) && route.matched[type]) {
        // type: canActivate or canDeactivate
        route.matched[type].forEach((guard) => {
            let guardInstance = activator.getInstance(guard);
            if (!isFunction(guardInstance[type])) { throw new Error('Invalid hook type'); }
            hooks.push(guardInstance[type]);
        });
    }
    return hooks;
}

export class Guard {
    _activator: Activator;
    constructor() {
        this._activator = new Activator();
    }

    checkCanDeactivate(from: Route, to: Route, activeComponents: any, next: Function): void {
        const hooks = getRouteHooks('canDeactivate', from, this._activator);
        if (hooks.length > 0) {
            checkHooks(hooks, (hook, canDeactivate) => {
                hook(activeComponents, to, canDeactivate);
            }, next);
        }
        else { next(true); }
    }

    checkCanActivate(to: Route, next: Function): void {
        const hooks = getRouteHooks('canActivate', to, this._activator);
        if (hooks.length > 0) {
            checkHooks(hooks, (hook, canActivate) => {
                hook(to, canActivate);
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
