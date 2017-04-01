/*!
 * React Spa Router v0.0.8
 * (c) 2017 romagny13
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
	(factory((global.ReactSpaRouter = global.ReactSpaRouter || {}),global.React));
}(this, (function (exports,React) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var inBrowser = typeof window !== 'undefined';
var supportHistory = inBrowser && (function () {
    var userAgent = window.navigator.userAgent;
    if ((userAgent.indexOf('Android 2.') !== -1 || userAgent.indexOf('Android 4.0') !== -1)
        && userAgent.indexOf('Mobile Safari') !== -1
        && userAgent.indexOf('Chrome') === -1
        && userAgent.indexOf('Windows Phone') === -1) {
        return false;
    }
    return window.history && 'pushState' in window.history;
})();

function isUndefined(value) { return typeof value === 'undefined'; }
function isDefined(value) { return typeof value !== 'undefined'; }
function isString(value) { return typeof value === 'string'; }

function isObject(value) { return value !== null && typeof value === 'object'; }
function isFunction(value) { return typeof value === 'function'; }
function isBoolean(value) { return typeof value === 'boolean'; }

var isArray = Array.isArray;
function isPromise(obj) { return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'; }
function doLater(next) {
    setTimeout(next);
}

function scrollToElement(selectorOrElement) {
    var element = isString(selectorOrElement) ? document.querySelector(selectorOrElement) : selectorOrElement;
    if (element) {
        var docRect = document.documentElement.getBoundingClientRect(), elRect = element.getBoundingClientRect();
        var x_1 = elRect.left - docRect.left;
        var y_1 = elRect.top - docRect.top;
        doLater(function () { return window.scrollTo(x_1, y_1); });
    }
}

function getOrigin() {
    return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}
function getBase() {
    var base = document.querySelector('base');
    return base ? base.href : getOrigin();
}

function convertToQueryString(query) {
    var result = [];
    for (var name in query) {
        if (query.hasOwnProperty(name)) {
            result.push(name + '=' + encodeURIComponent(query[name]));
        }
    }
    if (result.length > 0) {
        return '?' + result.join('&');
    }
    return '';
}
function formatFragment(fragment) {
    if (fragment !== '') {
        return fragment.charAt(0) === '#' ? fragment : '#' + fragment;
    }
    return '';
}
function convertToFullPathString(path, query, fragment) {
    var result = path;
    // query
    if (isObject(query)) {
        result += convertToQueryString(query);
    }
    // fragment
    if (isString(fragment)) {
        result += formatFragment(fragment);
    }
    return result;
}
function convertToFullPathStringWithQueryString(path, queryString, fragment) {
    // path with params + query string + fragment
    var fullPath = path;
    if (isString(queryString)) {
        fullPath += queryString;
    }
    if (isString(fragment)) {
        fullPath += formatFragment(fragment);
    }
    return fullPath;
}
function convertToPathString(routePath, params) {
    // path + params
    return routePath.replace(/:(\w+)(\([^\)]+\))?/g, function (match, param, paramMatch) {
        if (params.hasOwnProperty(param)) {
            return params[param];
        }
        else {
            throw new Error('Parameter ' + param + ' not found');
        }
    });
}

function trimBase(base, url) {
    /*
    BASE                                | HOME
    - http://mysite.com (origin)        | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
    - http://mysite.com/ (base tag)     | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
    - http://mysite.com/blog            | http://mysite.com/blog                                            | http://mysite.com/blog/posts/10 or http://mysite.com/blog/#/posts/10
    - http://mysite.com/index.html      | http://mysite.com/index.html or http://mysite.com/index.html#/    | http://mysite.com/index.html#/posts/10
                                        => '' or '/' or '/#/' or '#/' ==> '/'                                => 'posts/10' or  '/#/posts/10' or '#/posts/10' ==> '/posts/10'
    */
    var fullPath = url.replace(base, '');
    if (fullPath === '') {
        return '/';
    }
    else {
        // remove # or /#
        fullPath = fullPath.replace(/^(\/#|#)/, '');
        // add /
        if (fullPath.charAt(0) !== '/') {
            fullPath = '/' + fullPath;
        }
        return fullPath;
    }
}
function trimQueryAndFragment(url) {
    if (url.indexOf('?') !== -1) {
        // remove query string
        url = url.split('?')[0];
    }
    else if (url.indexOf('#') !== -1) {
        // remove fragment
        url = url.split('#')[0];
    }
    return url;
}
function getPathOnly(base, url) {
    // full path
    var path = trimBase(base, url);
    // trim query and fragment
    return trimQueryAndFragment(path);
}

var Route = (function () {
    function Route(config) {
        /* resolved route */
        this.url = config.url;
        this.path = config.path;
        this.params = config.params;
        this.queryString = config.queryString;
        this.query = config.query;
        this.fragment = config.fragment;
        this.matched = config.matched;
    }
    return Route;
}());

function isOther(value) {
    return value === '**';
}
function match(routePath, toPath) {
    var pattern = isOther(routePath) ? '.*' : routePath.replace(/:(\w+)(\([^\)]+\))?/g, function (match, param, paramMatch) {
        if (paramMatch) {
            return paramMatch;
        }
        else {
            return '([0-9]+)'; /* default number */
        }
    });
    var regex = new RegExp('^' + pattern + '$', 'i');
    return regex.test(toPath);
}
function getMatched(routeConfigs, path) {
    for (var name in routeConfigs) {
        if (routeConfigs.hasOwnProperty(name)) {
            var routeConfig = routeConfigs[name];
            if (routeConfig.children) {
                var childRouteConfig = getMatched(routeConfig.children, path);
                if (isDefined(childRouteConfig)) {
                    return childRouteConfig;
                }
            }
            if (match(routeConfig.path, path)) {
                return routeConfig;
            }
        }
    }
}
function getParams(routePath, path) {
    var params = {};
    var parameterNames = [];
    // build regex and get keys
    var pattern = isOther(routePath) ? '.*' : routePath.replace(/:(\w+)(\([^\)]+\))?/g, function (match, param, paramMatch) {
        parameterNames.push(param);
        if (paramMatch) {
            return paramMatch;
        }
        else {
            return '([0-9]+)';
        }
    });
    var regex = new RegExp('^' + pattern + '$', 'i');
    // get matches and set values
    var matches = path.match(regex);
    if (matches) {
        matches.shift();
        [].slice.call(matches).forEach(function (value, i) {
            var name = parameterNames[i];
            params[name] = value;
        });
    }
    return params;
}
function getQuery(queryString) {
    var result = {};
    if (isDefined(queryString)) {
        queryString.split('&').forEach(function (keyValueString) {
            var keyValue = keyValueString.split('=');
            result[keyValue[0]] = decodeURIComponent(keyValue[1]);
        });
    }
    return result;
}
function getQueryString(url) {
    // extract 'q=abc&cat=10' from '/posts/10?q=abc&cat=10#section1'
    if (url.indexOf('?') !== -1) {
        var result = url.split('?')[1];
        // remove fragment
        result = result.replace(/#[^\/](.)+$/, '');
        return result;
    }
}
function getFragment(url) {
    var matches = url.match(/#[^\/](.)+$/);
    if (matches) {
        return matches[0];
    }
}
var RouteResolver = (function () {
    function RouteResolver() {
    }
    RouteResolver.prototype.resolve = function (routeConfigs, path, url) {
        /*
         RouteConfig config:
         -	name
         -	path pattern
         -  action / actions
         -	Guards can activate, can deactivate
         -	Params matches
         Resolved Route with url:
         -	url (href)
         -	path (path with parameters resolved '/posts/10', without query and segment)
         -	params (path parameters object)
         -	query (search object) + queryString
         -	fragment (string '#section1')
         -  matched (RouteConfig)
         */
        var params, queryString, query, fragment;
        var matched = getMatched(routeConfigs, path);
        if (matched) {
            params = getParams(matched.path, path); // cannot resolve without route config pattern
            queryString = getQueryString(url);
            query = getQuery(queryString);
            fragment = getFragment(url);
        }
        return new Route({ url: url, path: path, params: params, queryString: queryString, query: query, fragment: fragment, matched: matched });
    };
    return RouteResolver;
}());

function getFunctionName(fn) {
    return fn.name || fn.toString().match(/^function\s*([^\s(]+)/)[1];
}
var Activator = (function () {
    function Activator() {
        this.cache = {};
    }
    Activator.prototype.clear = function () {
        this.cache = {};
    };
    Activator.prototype.getNewInstance = function (ctor) {
        if (isFunction(ctor)) {
            var name = getFunctionName(ctor);
            var instance = new ctor();
            this.cache[name] = instance;
            return instance;
        }
        else {
            throw TypeError('Invalid type. Require a function / class');
        }
    };
    Activator.prototype.getInstance = function (ctor) {
        if (isFunction(ctor)) {
            var name = getFunctionName(ctor);
            if (this.cache.hasOwnProperty(name)) {
                return this.cache[name];
            }
            else {
                return this.getNewInstance(ctor);
            }
        }
        else {
            throw TypeError('Invalid type. Require a function / class');
        }
    };
    return Activator;
}());
var activator = new Activator();

function checkHooks(hooks, handler, next) {
    var index = 0, length = hooks.length;
    function nextHook(fn) {
        handler(fn, function (response) {
            if (response === false || isString(response)) {
                next(response); /* cancel or redirection */
            }
            else {
                index++;
                if (index < length) {
                    nextHook(hooks[index]);
                }
                else {
                    next(true);
                }
            }
        });
    }
    if (length > 0) {
        nextHook(hooks[index]);
    }
    else {
        next(true);
    }
}
function getHooks(type, guards) {
    var result = [];
    guards.forEach(function (guard) {
        var guardInstance = activator.getInstance(guard);
        if (!isFunction(guardInstance[type])) {
            throw new Error('No function ' + type + ' found for guard instance');
        }
        result.push(guardInstance[type]);
    });
    return result;
}
function getActivateRouteHooks(route) {
    var type = 'canActivate', childType = 'canActivateChild';
    if (isDefined(route.matched)) {
        // canActivateChild
        var root = route.matched.root;
        if (root && isArray(root[childType])) {
            return getHooks(childType, root[childType]);
        }
        else if (isArray(route.matched[type])) {
            return getHooks(type, route.matched[type]);
        }
    }
    return [];
}
function getDeactivateRouteHooks(route) {
    var type = 'canDeactivate';
    if (isDefined(route.matched) && isArray(route.matched[type])) {
        return getHooks(type, route.matched[type]);
    }
    return [];
}
var Guard = (function () {
    function Guard() {
    }
    Guard.prototype.checkCanDeactivate = function (from, to, activeComponents, next) {
        var hooks = getDeactivateRouteHooks(from);
        if (hooks.length > 0) {
            checkHooks(hooks, function (hook, canDeactivate) {
                hook(activeComponents, to, canDeactivate);
            }, next);
        }
        else {
            next(true);
        }
    };
    Guard.prototype.checkCanActivate = function (to, next) {
        var hooks = getActivateRouteHooks(to);
        if (hooks.length > 0) {
            checkHooks(hooks, function (hook, canActivate) {
                hook(to, canActivate);
            }, next);
        }
        else {
            next(true);
        }
    };
    Guard.prototype.approve = function (from, to, activeComponents, next) {
        var _this = this;
        this.checkCanDeactivate(from, to, activeComponents, function (canDeactivate) {
            if (canDeactivate) {
                _this.checkCanActivate(to, next);
            }
            else {
                next(false);
            }
        });
    };
    return Guard;
}());

var HistoryMode = (function () {
    function HistoryMode() {
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
    HistoryMode.prototype._onSuccess = function (to) {
        this._onSuccessSubscribers.forEach(function (subscriber) {
            subscriber(to);
        });
    };
    HistoryMode.prototype._onError = function (error) {
        this._onErrorSubscribers.forEach(function (subscriber) {
            subscriber(error);
        });
    };
    HistoryMode.prototype.redirectTo = function (to, replace) {
        if (isString(to)) {
            if (replace) {
                this.replace(to);
            }
            else {
                this.go(to);
            }
        }
        else {
            throw new TypeError('Invalid redirect url');
        }
    };
    HistoryMode.prototype.check = function (url, path, replaceOnRedirect, onSuccess, onError) {
        var _this = this;
        var route = this._routeResolver.resolve(routes, path, url);
        if (isDefined(route.matched) && route.matched.redirectTo) {
            this.redirectTo(route.matched.redirectTo, replaceOnRedirect);
        }
        else {
            // check
            if (isUndefined(route.matched)) {
                // notfound
                this._guard.checkCanDeactivate(this.current, route, activeComponents, function (response) {
                    if (isString(response)) {
                        _this.redirectTo(response);
                    }
                    else if (response === false) {
                        onError({ type: 'aborted', route: route });
                    }
                    else {
                        onError({ type: 'notfound', route: route });
                    }
                });
            }
            else {
                this._guard.approve(this.current, route, activeComponents, function (response) {
                    if (isString(response)) {
                        _this.redirectTo(response);
                    }
                    else if (response === false) {
                        onError({ type: 'aborted', route: route });
                    }
                    else {
                        onSuccess(route);
                    }
                });
            }
        }
    };
    HistoryMode.prototype.go = function (urlOrPath) {
        var url = this.getUrl(this.base, urlOrPath);
        this.onDemand(url);
    };
    HistoryMode.prototype.replace = function (urlOrPath) {
        var url = this.getUrl(this.base, urlOrPath);
        this.onDemand(url, true);
    };
    HistoryMode.prototype.back = function () {
        window.history.go(-1);
    };
    HistoryMode.prototype.forward = function () {
        window.history.go(1);
    };
    HistoryMode.prototype.subscribe = function (onSuccess, onError) {
        this._onSuccessSubscribers.push(onSuccess);
        if (isFunction(onError)) {
            this._onErrorSubscribers.push(onError);
        }
        return this;
    };
    return HistoryMode;
}());

function formatUrl(value) {
    // format base 'http://mysite.com/' => 'http://mysite.com' in order to add path
    return value.replace(/\/$/, '');
}
var Html5History = (function (_super) {
    __extends(Html5History, _super);
    function Html5History() {
        return _super.call(this) || this;
    }
    Html5History.prototype.onLoad = function (fn) {
        var url = window.location.href;
        var path = getPathOnly(this.base, url);
        fn({ url: url, path: path });
    };
    Html5History.prototype.onChange = function (fn) {
        window.onpopstate = function (e) {
            // state is null when we click on a link with an anchor
            if (e.state) {
                fn(e.state);
            }
        };
    };
    Html5History.prototype.checkChanged = function (infos) {
        var _this = this;
        this.check(infos.url, infos.path, true, function (to) {
            _this.current = to;
            _this._onSuccess(to);
        }, function (event) {
            // Error
            window.history.pushState(_this.getState(), null, _this.current.url);
            _this._onError(event);
        });
    };
    Html5History.prototype.onDemand = function (url, replace) {
        var _this = this;
        var path = getPathOnly(this.base, url);
        this.check(url, path, replace, function (to) {
            _this.current = to;
            if (replace) {
                window.history.replaceState(_this.getState(), null, url);
            }
            else {
                window.history.pushState(_this.getState(), null, url);
            }
            _this._onSuccess(to);
        }, function (event) {
            _this._onError(event);
        });
    };
    Html5History.prototype.run = function () {
        var _this = this;
        this.onLoad(function (infos) {
            _this.check(infos.url, infos.path, true, function (to) {
                _this.current = to;
                window.history.replaceState(_this.getState(), null, _this.current.url);
                _this._onSuccess(to);
            }, function (event) {
                _this._onError(event);
            });
        });
        this.onChange(function (infos) {
            _this.checkChanged(infos);
        });
    };
    Html5History.prototype.getState = function () {
        return { url: this.current.url, path: this.current.path, name: this.current.name };
    };
    Html5History.prototype.getUrl = function (base, urlOrPath) {
        return urlOrPath.indexOf(base) !== -1 ? urlOrPath : formatUrl(base) + urlOrPath;
    };
    return Html5History;
}(HistoryMode));

var HashHistory = (function (_super) {
    __extends(HashHistory, _super);
    function HashHistory() {
        return _super.call(this) || this;
    }
    HashHistory.prototype.onLoad = function (fn) {
        var url = window.location.href;
        var path = getPathOnly(this.base, url);
        fn({ url: url, path: path });
    };
    HashHistory.prototype.onChange = function (fn) {
        var _this = this;
        window.onhashchange = function () {
            var url = window.location.href;
            var path = getPathOnly(_this.base, url);
            fn({ url: url, path: path });
        };
    };
    HashHistory.prototype.checkChanged = function (infos) {
        var _this = this;
        this.check(infos.url, infos.path, true, function (to) {
            _this.current = to;
            _this._onSuccess(to);
        }, function (event) {
            // Error
            window.location.hash = convertToFullPathStringWithQueryString(_this.current.path, _this.current.queryString, _this.current.fragment);
            _this._onError(event);
        });
    };
    HashHistory.prototype.onDemand = function (url, replace) {
        var _this = this;
        var path = getPathOnly(this.base, url);
        this.check(url, path, replace, function (to) {
            _this._isChecked = true;
            _this.current = to;
            if (replace) {
                window.location.replace(url);
            }
            else {
                window.location.hash = convertToFullPathStringWithQueryString(to.path, to.queryString, to.fragment);
            }
            _this._onSuccess(to);
        }, function (event) {
            _this._onError(event);
        });
    };
    HashHistory.prototype.run = function () {
        var _this = this;
        this.onLoad(function (infos) {
            _this.checkChanged(infos);
        });
        this.onChange(function (infos) {
            if (_this._isChecked) {
                _this._isChecked = false;
            }
            else {
                _this.checkChanged(infos);
            }
        });
    };
    HashHistory.prototype.getUrl = function (base, urlOrPath) {
        return urlOrPath.indexOf(base) !== -1 ? urlOrPath : base + '#' + urlOrPath;
    };
    return HashHistory;
}(HistoryMode));

function formatPath(path) {
    return path.charAt(0) !== '/' && path !== '**' ? '/' + path : path;
}
function formatChildPath(parentPath, childPath) {
    return childPath !== '' && childPath !== '/' ? formatPath(parentPath) + formatPath(childPath) : formatPath(parentPath);
}
function getActions(config) {
    var parents = config.parents;
    var actions = [];
    function doGetActions(config) {
        if (isFunction(config.action)) {
            actions.push(config.action);
        }
        else if (isArray(config.actions)) {
            config.actions.forEach(function (action) {
                actions.push(action);
            });
        }
    }
    // parents
    parents.forEach(function (parent) {
        doGetActions(parent);
    });
    // current
    doGetActions(config);
    return actions;
}
function createAction(action) {
    /* create a function with params to pass to real action that could be called */
    return function (params, next, onError) {
        try {
            var result = action(params);
            if (isPromise(result)) {
                result.then(next, onError);
            }
            else {
                next(result);
            }
        }
        catch (error) {
            onError(error);
        }
    };
}
var RouteConfig = (function () {
    function RouteConfig(config) {
        var _this = this;
        if (isUndefined(config)) {
            throw new Error('Config required');
        }
        if (isUndefined(config.path)) {
            throw new Error('Path required');
        }
        this.path = formatPath(config.path);
        this.name = config.name || config.path;
        if (config.action) {
            this.action = createAction(config.action);
        }
        else if (config.actions) {
            this.actions = [];
            config.actions.forEach(function (action) {
                _this.actions.push(createAction(action));
            });
        }
        this.canActivate = config.canActivate;
        this.canDeactivate = config.canDeactivate;
        this.canActivateChild = config.canActivateChild;
        this.redirectTo = config.redirectTo;
        this.data = config.data;
        this.parent = config.parent;
        this.parents = config.parents || [];
        if (isDefined(config.children)) {
            this.children = {};
            config.children.forEach(function (childConfig) {
                childConfig.path = formatChildPath(_this.path, childConfig.path);
                if (isUndefined(childConfig.name)) {
                    childConfig.name = childConfig.path;
                }
                childConfig.parent = _this;
                childConfig.parents = _this.parents.concat(_this);
                _this.children[childConfig.name] = new RouteConfig(childConfig);
            });
        }
    }
    Object.defineProperty(RouteConfig.prototype, "root", {
        get: function () {
            return this.parents[0];
        },
        enumerable: true,
        configurable: true
    });
    return RouteConfig;
}());

var RouterMessenger = (function () {
    function RouterMessenger() {
        this._subscribers = {};
        this._pending = {};
    }
    RouterMessenger.prototype.clearPending = function () {
        this._pending = {};
    };
    RouterMessenger.prototype.subscribe = function (viewName, subscriber) {
        var _this = this;
        if (!isArray(this._subscribers[viewName])) {
            this._subscribers[viewName] = [];
        }
        this._subscribers[viewName].push(subscriber);
        // pending
        if (this._pending.hasOwnProperty(viewName)) {
            this._subscribers[viewName].forEach(function (subscriber) {
                subscriber(_this._pending[viewName]);
            });
            delete this._pending[viewName];
        }
    };
    RouterMessenger.prototype.publish = function (viewName, component) {
        if (this._subscribers[viewName]) {
            this._subscribers[viewName].forEach(function (subscriber) {
                subscriber(component);
            });
        }
        else {
            this._pending[viewName] = component;
        }
    };
    return RouterMessenger;
}());
var routerMessenger = new RouterMessenger();

function isValidMode(value) {
    return /^(hash|history)$/.test(value);
}
var activeRoute;
var activeComponents = {};
var routes = {};
var routerHistory;
function setActiveComponent(name, instance) {
    activeComponents[name] = instance;
}
function addRoutesInternal(routeConfigs) {
    routeConfigs.forEach(function (routeConfig) {
        if (isUndefined(routeConfig.path)) {
            throw new Error('Path required');
        }
        var name = routeConfig.name || routeConfig.path;
        if (routes.hasOwnProperty(name)) {
            throw new Error('RouteConfig ' + name + ' already registered');
        }
        routes[name] = new RouteConfig(routeConfig);
    });
}

function doActions(actions, route, router, onComplete) {
    var length = actions.length, index = 0, result, error;
    function checkEnd() {
        index++;
        if (index < length) {
            next(actions[index]);
        }
        else if (onComplete) {
            onComplete();
        }
    }
    function next(action) {
        action({ route: route, router: router, result: result, error: error }, function (actionResult) {
            result = actionResult;
            error = undefined;
            checkEnd();
        }, function (err) {
            result = undefined;
            error = err;
            checkEnd();
        });
    }
    if (length > 0) {
        next(actions[0]);
    }
    else if (onComplete) {
        onComplete();
    }
}
var Router = (function () {
    function Router(config) {
        if (isUndefined(config)) {
            throw new Error('Config required');
        }
        if (!isArray(config.routes)) {
            throw new Error('Routes required');
        }
        // history
        if (isUndefined(config.mode)) {
            config.mode = 'hash';
        }
        if (!isValidMode(config.mode)) {
            throw new Error('Invalid mode (hash or history)');
        }
        if (config.mode === 'history' && !supportHistory) {
            config.mode = 'hash';
            console.warn('Html5 history not supported: switch to hash mode.');
        }
        this._mode = config.mode;
        if (this._mode === 'hash') {
            routerHistory = new HashHistory();
        }
        else {
            routerHistory = new Html5History();
        }
        // scroll
        this._scroll = isBoolean(config.scroll) ? config.scroll : true;
        // routes
        addRoutesInternal(config.routes);
    }
    Router.prototype.beforeEach = function (fn) {
        this._beforeEachHook = fn;
        return this;
    };
    Router.prototype.afterEach = function (fn) {
        this._afterEachHook = fn;
        return this;
    };
    Router.prototype._doBeforeEach = function (next) {
        if (isFunction(this._beforeEachHook)) {
            this._beforeEachHook(next);
        }
        else {
            next();
        }
    };
    Router.prototype.run = function (onSuccess, onError) {
        var _this = this;
        routerHistory.subscribe(function (route) {
            routerMessenger.clearPending();
            activeRoute = route;
            if (isFunction(onSuccess)) {
                onSuccess(route);
            }
            var config = route.matched;
            _this._doBeforeEach(function () {
                var actions = getActions(config);
                doActions(actions, route, _this, function () {
                    if (_this._afterEachHook) {
                        _this._afterEachHook(route);
                    }
                    doLater(function () {
                        if (route.fragment && _this._scroll) {
                            scrollToElement(route.fragment);
                        }
                    });
                });
            });
        }, function (event) {
            if (isFunction(onError)) {
                onError(event);
            }
        }).run();
        return this;
    };
    Router.prototype.navigateToUrl = function (url) {
        if (!isString(url)) {
            throw new TypeError('String url required');
        }
        routerHistory.go(url);
    };
    Router.prototype.navigateTo = function (routeName, params, query, fragment) {
        var route = routes[routeName];
        if (isUndefined(route)) {
            throw new Error('No route found for route name :' + routeName);
        }
        var path = convertToPathString(route.path, params);
        var fullPath = convertToFullPathString(path, query, fragment);
        this.navigateToUrl(fullPath);
    };
    Router.prototype.replaceUrl = function (url) {
        if (!isString(url)) {
            throw new TypeError('String url required');
        }
        routerHistory.replace(url);
    };
    Router.prototype.replace = function (routeName, params, query, fragment) {
        var route = routes[routeName];
        if (isUndefined(route)) {
            throw new Error('No route found for route name : ' + routeName);
        }
        var path = convertToPathString(route.path, params);
        var fullPath = convertToFullPathString(path, query, fragment);
        this.replaceUrl(fullPath);
    };
    Router.prototype.goBack = function () {
        routerHistory.back();
    };
    Router.prototype.goForward = function () {
        routerHistory.forward();
    };
    return Router;
}());

function checkIsActive(fullCurrentPathString, fullLinkPathString, exact, activePattern) {
    var isActive;
    if (activePattern) {
        return activePattern.test(fullCurrentPathString);
    }
    else {
        // exact by default
        if (exact) {
            // => compare all full link path string with full current path
            return fullCurrentPathString === fullLinkPathString;
        }
        else {
            // => compare link path without query and fragment with current path
            var linkPath = trimQueryAndFragment(fullLinkPathString);
            return fullCurrentPathString.indexOf(linkPath) !== -1;
        }
    }
}
function getClassName(isActive, className, activeClassName) {
    if (isActive && activeClassName) {
        return className && className !== '' ? className + ' ' + activeClassName : activeClassName;
    }
    else {
        return className;
    }
}
function getFullLinkPathString(to) {
    if (isString(to)) {
        return to;
    }
    else if (isObject(to)) {
        if (to.name) {
            var route = routes[to.name];
            if (route) {
                var path = convertToPathString(route.path, to.params);
                return convertToFullPathString(path, to.query, to.fragment);
            }
        }
        else if (to.path) {
            return convertToFullPathString(to.path, to.query, to.fragment);
        }
    }
    throw new Error('Cannot resolve link \'to\'');
}
function getFullCurrentPathString(base) {
    return trimBase(base, window.location.href);
}
var Link = (function (_super) {
    __extends(Link, _super);
    function Link(props) {
        var _this = _super.call(this, props) || this;
        _this._base = getBase();
        _this._fullLinkPathString = getFullLinkPathString(_this.props.to);
        _this._linkHref = routerHistory && routerHistory instanceof HashHistory ? '#' + _this._fullLinkPathString : _this._fullLinkPathString;
        var fullCurrentPathString = getFullCurrentPathString(_this._base);
        var isActive = _this.props.activeClassName ?
            checkIsActive(fullCurrentPathString, _this._fullLinkPathString, _this.props.exact, _this.props.activePattern)
            : false;
        _this.state = {
            isActive: isActive
        };
        _this.onClick = _this.onClick.bind(_this);
        return _this;
    }
    Link.prototype.componentDidMount = function () {
        var _this = this;
        routerHistory.subscribe(function (route) {
            if (_this.props.activeClassName) {
                var fullCurrentPathString = getFullCurrentPathString(_this._base);
                var isActive = checkIsActive(fullCurrentPathString, _this._fullLinkPathString, _this.props.exact, _this.props.activePattern);
                _this.setState({
                    isActive: isActive
                });
            }
        });
    };
    Link.prototype.onClick = function (event) {
        event.preventDefault();
        routerHistory.go(this._fullLinkPathString);
    };
    Link.prototype.render = function () {
        var className = getClassName(this.state.isActive, this.props.className, this.props.activeClassName);
        if (this.props.tag) {
            var props = { id: this.props.id, href: this._linkHref, onClick: this.onClick, className: this.props.className, style: this.props.style };
            return React.createElement(this.props.tag, { className: className }, React.createElement('a', props, this.props.children));
        }
        else {
            var props = { id: this.props.id, href: this._linkHref, onClick: this.onClick, className: className, style: this.props.style };
            return React.createElement('a', props, this.props.children);
        }
    };
    return Link;
}(React.Component));
Link.defaultProps = {
    exact: true
};

function viewRender(component, viewName) {
    if (!isString(viewName)) {
        viewName = 'default';
    }
    routerMessenger.publish(viewName, component);
}
var RouterView = (function (_super) {
    __extends(RouterView, _super);
    function RouterView(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            previous: null,
            current: null
        };
        _this._firstTime = true;
        return _this;
    }
    RouterView.prototype._preventAnimation = function () {
        if (this._isAnimating) {
            clearTimeout(this._leaveTimer);
            clearTimeout(this._enterTimer);
            this.setState({
                previous: null,
                previousClassName: null,
                current: this._component,
                currentClassName: 'router-page current'
            });
            this._isAnimating = false;
        }
    };
    RouterView.prototype.componentDidMount = function () {
        var _this = this;
        routerMessenger.subscribe(this.props.name, function (component) {
            var self = _this, leave = _this.props.leave, leaveTimeout = _this.props.leaveTimeout, enter = _this.props.enter, enterTimeout = _this.props.enterTimeout, simultaneous = _this.props.simultaneous, count = 0;
            function checkAnimationEnd() {
                count++;
                if (count === 2) {
                    self._isAnimating = false;
                }
            }
            if (_this._firstTime || (!enter && !leave)) {
                // no animation
                _this.setState({
                    current: component,
                    currentClassName: 'router-page current'
                });
                _this._firstTime = false;
            }
            else {
                if (simultaneous) {
                    _this._preventAnimation();
                    doLater(function () {
                        _this._component = component;
                        _this._isAnimating = true;
                        var previous = _this.state.current;
                        _this.setState({
                            previous: previous,
                            previousClassName: 'router-page ' + leave + ' current',
                            current: component,
                            currentClassName: 'router-page ' + enter
                        });
                        // leave
                        _this._leaveTimer = setTimeout(function () {
                            _this.setState({
                                previous: null
                            });
                            checkAnimationEnd();
                        }, leaveTimeout);
                        // enter
                        _this._enterTimer = setTimeout(function () {
                            _this.setState({
                                currentClassName: 'router-page current'
                            });
                            checkAnimationEnd();
                        }, enterTimeout);
                    });
                }
                else {
                    /*
                        .router-page  |  .fadeIn            |  .current
                        opacity = 0   |  transition 0 => 1  |  opacity = 1
                    */
                    _this._preventAnimation();
                    doLater(function () {
                        _this._component = component;
                        _this._isAnimating = true;
                        // leave
                        _this.setState({
                            currentClassName: 'router-page ' + leave + ' current'
                        });
                        _this._leaveTimer = setTimeout(function () {
                            _this.setState({
                                current: component,
                                currentClassName: 'router-page ' + enter
                            });
                            _this._enterTimer = setTimeout(function () {
                                // enter
                                _this.setState({
                                    currentClassName: 'router-page current'
                                });
                                _this._isAnimating = false;
                            }, enterTimeout);
                        }, leaveTimeout);
                    });
                }
            }
        });
    };
    RouterView.prototype.render = function () {
        return (React.createElement("div", { id: this.props.id, className: this.props.className, style: this.props.style },
            this.state.current ? React.createElement("div", { className: this.state.currentClassName, style: { position: 'relative' } }, this.state.current) : null,
            this.state.previous ? React.createElement("div", { className: this.state.previousClassName }, this.state.previous) : null));
    };
    return RouterView;
}(React.Component));
RouterView.defaultProps = {
    name: 'default'
};

exports.Link = Link;
exports.RouterView = RouterView;
exports.viewRender = viewRender;
exports.Router = Router;
exports.setActiveComponent = setActiveComponent;
exports.Route = Route;
exports.RouteConfig = RouteConfig;

Object.defineProperty(exports, '__esModule', { value: true });

})));
