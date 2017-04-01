import { HistoryMode } from './HistoryMode';
import { getPathOnly } from './util/url';

function formatUrl(value: string): string {
    // format base 'http://mysite.com/' => 'http://mysite.com' in order to add path
    return value.replace(/\/$/, '');
}

export class Html5History extends HistoryMode {
    constructor() {
        super();
    }

    onLoad(fn: Function): void {
        let url = window.location.href;
        let path = getPathOnly(this.base, url);
        fn({ url, path });
    }

    onChange(fn: Function): void {
        window.onpopstate = (e) => {
            // state is null when we click on a link with an anchor
            if (e.state) {
                fn(e.state);
            }
        };
    }

    checkChanged(infos: { url, path }): void {
        this.check(infos.url, infos.path, true, (to) => {
            this.current = to;
            this._onSuccess(to);
        }, (event) => {
            // Error
            window.history.pushState(this.getState(), null, this.current.url);
            this._onError(event);
        });
    }

    onDemand(url: string, replace?: boolean): void {
        let path = getPathOnly(this.base, url);
        this.check(url, path, replace, (to) => {
            this.current = to;
            if (replace) { window.history.replaceState(this.getState(), null, url); }
            else { window.history.pushState(this.getState(), null, url); }
            this._onSuccess(to);
        }, (event) => {
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

    getUrl(base: string, urlOrPath: string): string {
        return urlOrPath.indexOf(base) !== -1 ? urlOrPath : formatUrl(base) + urlOrPath;
    }
}
