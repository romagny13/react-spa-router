import { isUndefined, isDefined, isFunction, isArray, isPromise } from './util';

export function formatPath(path: string): string {
    return path.charAt(0) !== '/' && path !== '**' ? '/' + path : path;
}

export function formatChildPath(parentPath: string, childPath: string): string {
    return childPath !== '' && childPath !== '/' ? formatPath(parentPath) + formatPath(childPath) : formatPath(parentPath);
}

export function getActions(config: any): Array<Function> {
    let parents = config.parents;
    let actions = [];

    function doGetActions(config) {
        if (isFunction(config.action)) { actions.push(config.action); }
        else if (isArray(config.actions)) {
            config.actions.forEach((action) => {
                actions.push(action);
            });
        }
    }
    // parents
    parents.forEach((parent) => {
        doGetActions(parent);
    });
    // current
    doGetActions(config);
    return actions;
}

export function createAction(action: Function): Function {
    /* create a function with params to pass to real action that could be called */
    return (params, next) => {
        let result = action(params);
        if (isPromise(result)) {
            result.then(next);
        }
        else { next(result); }
    };
}

export class RouteConfig {
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

    get root(): any {
        return this.parents[0];
    }

    constructor(config: any) {
        if (isUndefined(config)) { throw new Error('Config required'); }
        if (isUndefined(config.path)) { throw new Error('Path required'); }

        this.path = formatPath(config.path);
        this.name = config.name || config.path;
        if (config.action) {
            this.action = createAction(config.action);
        }
        else if (config.actions) {
            this.actions = [];
            config.actions.forEach((action) => {
                this.actions.push(createAction(action));
            });
        }

        this.canActivate = config.canActivate;
        this.canDeactivate = config.canDeactivate;
        this.redirectTo = config.redirectTo;
        this.data = config.data;
        this.parent = config.parent;
        this.parents = config.parents || [];

        if (isDefined(config.children)) {
            this.children = {};
            config.children.forEach((childConfig) => {
                childConfig.path = formatChildPath(this.path, childConfig.path);
                if (isUndefined(childConfig.name)) { childConfig.name = childConfig.path; }
                childConfig.parent = this;
                childConfig.parents = this.parents.concat(this);
                this.children[childConfig.name] = new RouteConfig(childConfig);
            });
        }
    }
}

