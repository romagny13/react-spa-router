import { isString, isFunction, isDefined, isUndefined, getBase } from './util';
import { RouteResolver } from './RouteResolver';
import { Route } from './Route';
import { Guard } from './Guard';
import { routes, activeComponents } from './Router';

export abstract class HistoryMode {
    _routeResolver: RouteResolver;
    _guard: Guard;
    _onSuccessSubscribers: Function[];
    _onErrorSubscribers: Function[];
    current: any;
    base: string;
    constructor() {
        /*
            load
            on change (after url changed)
            on demand (click route link, go/ replace programmatically)
        */
        this._onSuccessSubscribers = [];
        this._onErrorSubscribers = [];
        this._routeResolver = new RouteResolver();
        this._guard = new Guard();

        this.base = getBase();
        this.current = new Route({ path: '/', url: this.base });
    }

    _onSuccess(to) {
        this._onSuccessSubscribers.forEach((subscriber) => {
            subscriber(to);
        });
    }

    _onError(error) {
        this._onErrorSubscribers.forEach((subscriber) => {
            subscriber(error);
        });
    }

    redirectTo(to: string, replace?: boolean): void {
        if (isString(to)) {
            if (replace) { this.replace(to); }
            else { this.go(to); }
        }
        else { throw new TypeError('Invalid redirect url'); }
    }

    check(url: string, path: string, replaceOnRedirect: boolean, onSuccess: Function, onError: Function) {
        let route = this._routeResolver.resolve(routes, path, url);
        if (isDefined(route.matched) && route.matched.redirectTo) {
            this.redirectTo(route.matched.redirectTo, replaceOnRedirect);
        }
        else {
            // check
            if (isUndefined(route.matched)) {
                // notfound
                this._guard.checkCanDeactivate(this.current, route, activeComponents, (response) => {
                    if (isString(response)) { this.redirectTo(response); }
                    else if (response === false) { onError({ type: 'aborted', route }); }
                    else { onError({ type: 'notfound', route }); }
                });
            }
            else {
                this._guard.approve(this.current, route, activeComponents, (response) => {
                    if (isString(response)) { this.redirectTo(response); }
                    else if (response === false) { onError({ type: 'aborted', route }); }
                    else { onSuccess(route); }
                });
            }
        }
    }

    go(urlOrPath: string): void {
        let url = this.getUrl(this.base, urlOrPath);
        this.onDemand(url);
    }

    replace(urlOrPath: string): void {
        let url = this.getUrl(this.base, urlOrPath);
        this.onDemand(url, true);
    }

    back(): void {
        window.history.go(-1);
    }

    forward(): void {
        window.history.go(1);
    }

    subscribe(onSuccess: Function, onError?: Function) {
        this._onSuccessSubscribers.push(onSuccess);
        if (isFunction(onError)) { this._onErrorSubscribers.push(onError); }
        return this;
    }

    abstract onLoad(fn: Function): void;
    abstract onChange(fn: Function): void;
    abstract onDemand(url: string, replace?: boolean): any;
    abstract run(): void;
    abstract getUrl(base: string, urlOrPath: string): string;
}