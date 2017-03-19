import { isString, isObject, isDefined } from './types';

export function convertToQueryString(query: any) {
    let result = [];
    for (let name in query) {
        if (query.hasOwnProperty(name)) {
            result.push(name + '=' + encodeURIComponent(query[name]));
        }
    }
    if (result.length > 0) {
        return '?' + result.join('&');
    }
    return '';
}

export function formatFragment(fragment: any) {
    if (fragment !== '') {
        return fragment.charAt(0) === '#' ? fragment : '#' + fragment;
    }
    return '';
}

export function convertToFullPathString(path: string, query?: any, fragment?: string): string {
    let result = path;

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

export function convertToPathString(routePath: string, params: any) {
    return routePath.replace(/:(\w+)(\([^\)]+\))?/g, (match, param, paramMatch) => {
        if (params.hasOwnProperty(param)) { return params[param]; }
        else { throw new Error('Parameter ' + param + ' not found'); }
    });
}
