import { isUndefined, isString } from './util';
import { RouteConfig } from './RouteConfig';

export class Route {
    url: string;
    path: string;
    params: any;
    queryString: string;
    query: any;
    fragment: string;
    matched: RouteConfig;
    constructor(config: any) {
        /* resolved route */
        this.url = config.url;
        this.path = config.path;
        this.params = config.params;
        this.queryString = config.queryString;
        this.query = config.query;
        this.fragment = config.fragment;
        this.matched = config.matched;
    }
}

