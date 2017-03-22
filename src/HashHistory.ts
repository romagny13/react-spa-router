import { HistoryMode } from './HistoryMode';
import { Route } from './Route';
import { trimBase, getPathOnly } from './util/url';
import { convertToFullPathStringWithQueryString } from './util/path';

export class HashHistory extends HistoryMode {
    _isChecked: boolean;
    constructor() {
        super();
    }

    onLoad(fn: Function): void {
        let url = window.location.href;
        let path = getPathOnly(this.base, url);
        fn({ url, path });
    }

    onChange(fn: Function): void {
        window.onhashchange = () => {
            let url = window.location.href;
            let path = getPathOnly(this.base, url);
            fn({ url, path });
        };
    }

    checkChanged(infos: { url, path }): void {
        this.check(infos.url, infos.path, true, (to) => {
            this.current = to;
            this._onSuccess(to);
        }, (event) => {
            // Error
            window.location.hash = convertToFullPathStringWithQueryString(this.current.path, this.current.queryString, this.current.fragment);
            if (this._onError) { this._onError(event); }
        });
    }

    onDemand(url: string, replace?: boolean): void {
        let path = getPathOnly(this.base, url);
        this.check(url, path, replace, (to) => {
            this._isChecked = true;
            this.current = to;
            if (replace) { window.location.replace(url); }
            else { window.location.hash = convertToFullPathStringWithQueryString(to.path, to.queryString, to.fragment); }
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

    getUrl(base: string, urlOrPath: string): string {
        return urlOrPath.indexOf(base) !== -1 ? urlOrPath : base + '#' + urlOrPath;
    }
}
