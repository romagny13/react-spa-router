import { HistoryMode } from './HistoryMode';
import { Route } from './Route';
import { trimQueryAndFragment } from './util';

export class HashHistory extends HistoryMode {
    _isChecked: boolean;
    constructor() {
        super();
    }

    onLoad(fn: Function): void {
        let url = window.location.href;
        let path = this.getPath(this.baseHref, url);
        fn({ url, path });
    }

    onChange(fn: Function): void {
        window.onhashchange = () => {
            let url = window.location.href;
            let path = this.getPath(this.baseHref, url);
            fn({ url, path });
        };
    }

    checkChanged(infos: { url, path }): void {
        this.check(infos.url, infos.path, true, (to) => {
            this.current = to;
            this._onSuccess(to);
        }, (event) => {
            // Error
            window.location.hash = this.getFullHash(this.current);
            if (this._onError) { this._onError(event); }
        });
    }

    onDemand(url: string, replace?: boolean): void {
        let path = this.getPath(this.baseHref, url);
        this.check(url, path, replace, (to) => {
            this._isChecked = true;
            this.current = to;
            if (replace) { window.location.replace(url); }
            else { window.location.hash = this.getFullHash(to); }
            this._onSuccess(to);
        }, (event) => {
            // Error
            if (this._onError) { this._onError(event); }
        });
    }

    run() {
        this.onLoad((infos) => {
            this.checkChanged(infos);
        });

        this.onChange((infos) => {
            if (this._isChecked) { this._isChecked = false; }
            else { this.checkChanged(infos); }
        });
    }

    getFullHash(route: Route): string {
        let fullHash = route.path;
        fullHash += route.queryString || '';
        fullHash += route.fragment || '';
        return fullHash;
    }

    getPath(baseHref: string, url: string): string {
        /*
            base path:
            - http://mysite.com/ or http://mysite.com/index.html
            home:
            - http://mysite.com/ --> remove base path ''
            - or http://mysite.com/#/ --> remove base path '#/'
            - http://mysite.com/index.html --> remove base path ''
            - or http://mysite.com/index.html#/ --> remove base path '#/'
            other:
            - http://mysite.com/#/posts/10 --> remove base path '#/posts/10'
            - http://mysite.com/index.html#/posts/10 --> idem
        */

        let result;
        if (url.indexOf(baseHref) !== -1) {
            result = url.replace(baseHref, '');
            if (result === '') { return '/'; }
            else {
                if (result.charAt(0) === '#') { result = result.slice(1); }
                return trimQueryAndFragment(result);
            }
        }
        else {
            return trimQueryAndFragment(url);
        }
    }

    getUrl(baseHref: string, source: string): string {
        // source is path or url ?
        return source.indexOf(baseHref) !== -1 ? source : baseHref + '#' + source;
    }
}
