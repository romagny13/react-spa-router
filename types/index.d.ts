// Type definitions for react-spa-router 0.0.1
// Project: https://github.com/romagny13/react-spa-router
// Definitions by: romagny13 <https://github.com/romagny13>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface RouteConfig {
    path: string;
    action: Function;
    canActivate: Array<any>;
    canDeactivate: Array<any>;
    redirectTo: any;
    parent: RouteConfig;
    parents: Array<RouteConfig>;
    children: any;
    actions: any;
    name: string;
    data: any;
}

interface Route {
    url: string;
    path: string;
    params: any;
    queryString: string;
    query: any;
    fragment: string;
    matched: RouteConfig;
}

interface CanActivate {
    canActivate(route: Route, next: Function): void;
}

interface CanDeactivate {
    canDeactivate(activeComponents: any, route: Route, next: Function): void;
}

interface RouteConfigOptions {
    routes: any[];
    mode?: 'hash' | 'history';
    scroll?: boolean;
}

interface Router {
    new (config: RouteConfigOptions): Router;
    beforeEach(fn: Function): Router;
    afterEach(fn: Function): Router;
    run(onSuccess?: Function, onError?: Function): Router;
    navigateToUrl(url: string): void;
    navigateTo(routeName: string, params?: any, query?: any, fragment?: string): void;
    replaceUrl(url: string): void;
    replace(routeName: string, params?: any, query?: any, fragment?: string): void;
    goBack(): void;
    goForward(): void;
}

interface ReactSpaRouterStatic {
    Link: any;
    RouterView: any;
    CanActivate: CanActivate;
    CanDeactivate: CanDeactivate;
    Router: Router;
    viewRender: Function;
    setActiveComponent: Function;
    Route: Route;
    RouteConfig: RouteConfig;
}

declare var reactSpaRouter: ReactSpaRouterStatic;

declare module "react-spa-router" {
    export = reactSpaRouter;
}
