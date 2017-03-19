import { isUndefined, supportHistory, isArray, isString, isFunction, isBoolean, scrollToElement, convertToFullPathString, convertToPathString } from './util';
import { HistoryMode } from './HistoryMode';
import { Html5History } from './Html5History';
import { HashHistory } from './HashHistory';
import { RouteConfig, getActions } from './RouteConfig';
import { Route } from './Route';
import { routerMessenger } from './RouterMessenger';

function isValidMode(value: string): boolean {
    return /^(hash|history)$/.test(value);
}

let activeRoute: Route;
let activeComponents: any = {};
let routes: any = {};
let routerHistory: HistoryMode;

export function setActiveComponent(name, instance) {
    activeComponents[name] = instance;
}

export function addRoutesInternal(routeConfigs) {
    routeConfigs.forEach((routeConfig) => {
        if (isUndefined(routeConfig.path)) { throw new Error('Path required'); }
        let name = routeConfig.name || routeConfig.path;

        if (routes.hasOwnProperty(name)) { throw new Error('RouteConfig ' + name + ' already registered'); }
        routes[name] = new RouteConfig(routeConfig);
    });
}

export function clearRoutesInternal() {
    routes = {};
}

function doActions(actions, route, router, onComplete) {
    let length = actions.length,
        index = 0,
        result;

    function next(action) {
        action({ route, router, result }, (actionResult) => {
            result = actionResult;
            index++;
            if (index < length) { next(actions[index]); }
            else if (onComplete) { onComplete(); }
        });
    }

    if (length > 0) { next(actions[0]); }
    else if (onComplete) { onComplete(); }
}

export class Router {
    _scroll: any;
    _beforeEachHook: Function;
    _afterEachHook: Function;
    _mode: string;
    constructor(config: any) {
        if (isUndefined(config)) { throw new Error('Config required'); }
        if (!isArray(config.routes)) { throw new Error('Routes required'); }

        // history
        if (isUndefined(config.mode)) { config.mode = 'hash'; }
        if (!isValidMode(config.mode)) { throw new Error('Invalid mode (hash or history)'); }
        if (config.mode === 'history' && !supportHistory) {
            config.mode = 'hash';
            console.warn('Html5 history not supported: switch to hash mode.');
        }
        this._mode = config.mode;
        if (this._mode === 'hash') { routerHistory = new HashHistory(); }
        else { routerHistory = new Html5History(); }

        // scroll
        this._scroll = isBoolean(config.scroll) ? config.scroll : true;

        // routes
        addRoutesInternal(config.routes);
    }

    beforeEach(fn: Function): Router {
        this._beforeEachHook = fn;
        return this;
    }

    afterEach(fn: Function): Router {
        this._afterEachHook = fn;
        return this;
    }

    _doBeforeEach(next) {
        if (isFunction(this._beforeEachHook)) {
            this._beforeEachHook(next);
        }
        else { next(); }
    }

    run(onSuccess?: Function, onError?: Function): Router {
        routerHistory.subscribe((route: Route) => {
            routerMessenger.clearPending();
            activeRoute = route;
            if (isFunction(onSuccess)) { onSuccess(route); }
            let config = route.matched;
            this._doBeforeEach(() => {
                let actions = getActions(config);
                doActions(actions, route, this, () => {
                    if (route.fragment && this._scroll) {
                        scrollToElement(route.fragment);
                    }
                    if (this._afterEachHook) { this._afterEachHook(route); }
                });
            });
        }, (event) => {
            if (isFunction(onError)) { onError(event); }
        }).run();
        return this;
    }

    navigateToUrl(url: string): void {
        if (!isString(url)) { throw new TypeError('String url required'); }
        routerHistory.go(url);
    }

    navigateTo(routeName: string, params?: any, query?: any, fragment?: string): void {
        let route = routes[routeName];
        if (isUndefined(route)) { throw new Error('No route found for route name :' + routeName); }

        let path = convertToPathString(route.path, params);
        let fullPath = convertToFullPathString(path, query, fragment);
        this.navigateToUrl(fullPath);
    }

    replaceUrl(url: string): void {
        if (!isString(url)) { throw new TypeError('String url required'); }
        routerHistory.replace(url);
    }

    replace(routeName: string, params?: any, query?: any, fragment?: string): void {
        let route = routes[routeName];
        if (isUndefined(route)) { throw new Error('No route found for route name : ' + routeName); }

        let path = convertToPathString(route.path, params);
        let fullPath = convertToFullPathString(path, query, fragment);
        this.replaceUrl(fullPath);
    }

    goBack(): void {
        routerHistory.back();
    }

    goForward(): void {
        routerHistory.forward();
    }
}

export { activeRoute, activeComponents, routes, routerHistory };

