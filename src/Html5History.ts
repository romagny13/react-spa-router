import { HistoryMode } from './HistoryMode';
import { trimQueryAndFragment } from './util';

function formatUrl(value: string): string {
    // format base path url 'http://localhost:3000/' -> 'http://localhost:3000' in order to add short url
    return value.replace(/\/$/, '');
}

export class Html5History extends HistoryMode {
    constructor() {
        super();
    }

    onLoad(fn: Function): void {
        let url = window.location.href;
        let path = this.getPath(this.baseHref, url);
        fn({ url, path });
    }

    onChange(fn: Function): void {
        window.onpopstate = (e) => {
            fn(e.state);
        };
    }

    checkChanged(infos: { url, path }): void {
        this.check(infos.url, infos.path, true, (to) => {
            this.current = to;
            this._onSuccess(to);
        }, (event) => {
            // Error
            window.history.pushState(this.getState(), null, this.current.url);
            if (this._onError) { this._onError(event); }
        });
    }

    onDemand(url: string, replace?: boolean): void {
        let path = this.getPath(this.baseHref, url);
        this.check(url, path, replace, (to) => {
            this.current = to;
            if (replace) { window.history.replaceState(this.getState(), null, url); }
            else { window.history.pushState(this.getState(), null, url); }
            this._onSuccess(to);
        }, (event) => {
            // Error
            this._onError(event);
        });
    }

    run(): void {
        this.onLoad((infos) => {
            this.check(infos.url, infos.path, true, (to) => {
                this.current = to;
                window.history.replaceState(this.getState(), null, this.current.url);
                this._onSuccess(to);
            }, (event) => {
                // Error
               this._onError(event);
            });
        });

        this.onChange((infos) => {
            this.checkChanged(infos);
        });
    }

    getState(): any {
        return { url: this.current.url, path: this.current.path, name: this.current.name };
    }

    getPath(baseHref: string, url: string): string {
        /*
            base path:
            - http://mysite.com/
            home:
            - http://mysite.com/ --> remove base path ''
            other:
            - http://mysite.com/posts/10 --> remove base path 'posts/10'
        */
        if (url.indexOf(baseHref) !== -1) {
            let replacement = /\/$/.test(baseHref) ? '/' : '';
            let result = url.replace(baseHref, replacement);
            if (result === '') { return '/'; }
            else {
                return trimQueryAndFragment(result);
            }
        }
        else {
            return trimQueryAndFragment(url);
        }
    }

    getUrl(baseHref: string, source: string): string {
        // source is path or url ?
        return source.indexOf(baseHref) !== -1 ? source : formatUrl(baseHref) + source;
    }
}
