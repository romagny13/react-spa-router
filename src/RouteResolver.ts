import { Route } from './Route';
import { isDefined, isString, isObject } from './util';
import { RouteConfig } from './RouteConfig';

export function isOther(value) {
    return value === '**';
}

export function match(routePath: string, toPath: string): boolean {
    let pattern = isOther(routePath) ? '.*' : routePath.replace(/:(\w+)(\([^\)]+\))?/g, (match, param, paramMatch) => {
        if (paramMatch) { return paramMatch; }
        else { return '([0-9]+)'; /* default number */ }
    });
    let regex = new RegExp('^' + pattern + '$', 'i');
    return regex.test(toPath);
}

export function getMatched(routeConfigs: any, path: string): RouteConfig {
    for (let name in routeConfigs) {
        if (routeConfigs.hasOwnProperty(name)) {
            let routeConfig = routeConfigs[name];
            if (routeConfig.children) {
                let childRouteConfig = getMatched(routeConfig.children, path);
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

export function getParams(routePath: string, path: string): any {
    let params = {};
    let parameterNames = [];

    // build regex and get keys
    let pattern = isOther(routePath) ? '.*' : routePath.replace(/:(\w+)(\([^\)]+\))?/g, (match, param, paramMatch) => {
        parameterNames.push(param);
        if (paramMatch) { return paramMatch; }
        else { return '([0-9]+)'; }
    });
    let regex = new RegExp('^' + pattern + '$', 'i');

    // get matches and set values
    let matches = path.match(regex);
    if (matches) {
        matches.shift();
        [].slice.call(matches).forEach((value, i) => {
            let name = parameterNames[i];
            params[name] = value;
        });
    }
    return params;
}

export function getQuery(queryString: string): any {
    let result = {};
    if (isDefined(queryString)) {
        queryString.split('&').forEach((keyValueString) => {
            let keyValue = keyValueString.split('=');
            result[keyValue[0]] = decodeURIComponent(keyValue[1]);
        });
    }
    return result;
}

export function getQueryString(url: string): string {
    // extract 'q=abc&cat=10' from '/posts/10?q=abc&cat=10#section1'
    if (url.indexOf('?') !== -1) {
        let result = url.split('?')[1];
        // remove fragment
        result = result.replace(/#[^\/](.)+$/, '');
        return result;
    }
}

export function getFragment(url: string): string {
    let matches = url.match(/#[^\/](.)+$/);
    if (matches) {
        return matches[0];
    }
}

export class RouteResolver {

    resolve(routeConfigs: any, path: string, url: string): Route {
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
        let params,
            queryString,
            query,
            fragment;
        let matched = getMatched(routeConfigs, path);
        if (matched) {
            params = getParams(matched.path, path); // cannot resolve without route config pattern
            queryString = getQueryString(url);
            query = getQuery(queryString);
            fragment = getFragment(url);
        }
        return new Route({ url, path, params, queryString, query, fragment, matched });
    }
}
