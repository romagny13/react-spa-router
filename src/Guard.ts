import { Route } from './Route';
import { isDefined, isFunction } from './util';
import { activator } from './Activator';
import { isString, isArray } from './util/types';

export interface CanActivateChild {
    canActivate(childRoute: Route, next: Function): void;
}

export interface CanActivate {
    canActivate(route: Route, next: Function): void;
}

export interface CanDeactivate {
    canDeactivate(activeComponents: any, route: Route, next: Function): void;
}

export function checkHooks(hooks: Function[], handler: Function, next: Function): void {
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

function getHooks(type: string, guards: Array<any>) {
    let result = [];
    guards.forEach((guard) => {
        let guardInstance = activator.getInstance(guard);
        if (!isFunction(guardInstance[type])) { throw new Error('No function ' + type + ' found for guard instance'); }
        result.push(guardInstance[type]);
    });
    return result;
}

function getActivateRouteHooks(route: Route) {
    const type = 'canActivate',
        childType = 'canActivateChild';
    if (isDefined(route.matched)) {
        // canActivateChild
        let root = route.matched.root;
        if (root && isArray(root[childType])) {
            return getHooks(childType, root[childType]);
        }
        // canActivate
        else if (isArray(route.matched[type])) {
            return getHooks(type, route.matched[type]);
        }
    }
    return [];
}

function getDeactivateRouteHooks(route: Route) {
    const type = 'canDeactivate';
    if (isDefined(route.matched) && isArray(route.matched[type])) {
        return getHooks(type, route.matched[type]);
    }
    return [];
}

export class Guard {
    checkCanDeactivate(from: Route, to: Route, activeComponents: any, next: Function): void {
        const hooks = getDeactivateRouteHooks(from);
        if (hooks.length > 0) {
            checkHooks(hooks, (hook, canDeactivate) => {
                hook(activeComponents, to, canDeactivate);
            }, next);
        }
        else { next(true); }
    }

    checkCanActivate(to: Route, next: Function): void {
        const hooks = getActivateRouteHooks(to);
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
