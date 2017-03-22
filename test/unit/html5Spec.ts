import { assert } from 'chai';
import { addRoutesInternal, clearRoutesInternal } from '../../src/Router';
import { Html5History } from '../../src/Html5History';
import { getPathOnly } from '../../src/util/url';

/*
should notify on load
should notify on popstate (back,forward)
should notify on link click
should notify on route link click
should notify on go (navigate programmatically)
should notify on replace
// Guards
Should cancel before navigating
Should reset url on cancel after url changed
*/
describe('Html5 history', () => {

    let html5History: Html5History,
        base: HTMLElement,
        link: HTMLElement,
        subscriber,
        guardState = 'passing',
        guardCallback;
    function onUrlChanged(e) {
        // if (!subscriber) { throw new Error('Subscriber not found for Hash tests'); }
        subscriber(e);
    }

    function CancelActivate() {
        this.canActivate = function (route, next) {
            next(false);
        };
    }

    before(() => {
        base = document.createElement('base');
        base.setAttribute('href', window.location.href);
        document.querySelector('head').appendChild(base);

        link = document.createElement('a');
        link.setAttribute('href', 'link');
        document.querySelector('body').appendChild(link);

        addRoutesInternal([
            { name: 'home', path: '/' },
            { name: 'hashchange', path: '/hashchange' },
            { name: 'go', path: '/go' },
            { name: 'replace', path: '/replace' },
            { name: 'link', path: '/link' },
            { name: 'post-details', path: '/posts/:id' },
            { name: 'canceled', path: '/canceled', canActivate: [CancelActivate] }
        ]);
        html5History = new Html5History();
    });

    after(() => {
        base.parentElement.removeChild(base);
        link.parentElement.removeChild(link);
        window.history.replaceState(null, document.title, html5History.base);
        subscriber = null;
        guardCallback = null;
        html5History = null;
        clearRoutesInternal();
    });

    it('Should notify on load', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'home');
            done();
        };
        html5History.subscribe(onUrlChanged);
        html5History.run();
    });

    it('Should notify on go', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'go');
            done();
        };
        html5History.go('/go');
    });

    it('Should notify on popstate', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'home');
            done();
        };
        html5History.back();
    });

    it('Should go forward', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'go');
            done();
        };
        html5History.forward();
    });

    it('Should notify on replace', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'replace');
            done();
        };
        html5History.replace('/replace');
    });

    it('Should redirect', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'home');
            done();
        };
        html5History.redirectTo('/');
    });

    /* problem with phantomjs base url  and link
    it('Should cancel and reset after url changed', (done) => {
        subscriber = undefined;
        html5History.go('/canceled');
        setTimeout(function () {
            assert.equal(window.location.href, html5History.baseHref + 'replace');
            done();
        }, 1000);
    });

    it('Should notify on click link', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'link');
            done();
        };
        link.click();
    });*/

    /* infos */

    it('Should get route infos', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'post-details');
            assert.equal(route.path, '/posts/10');
            assert.equal(route.params.id, 10);
            assert.equal(route.query.q, 'abc');
            assert.equal(route.query.cat, '10');
            assert.equal(route.fragment, '#section1');
            done();
        };
        html5History.go('/posts/10?q=abc&cat=10#section1');
    });

    it('Should get url from path', () => {
        let baseHref = 'http://mysite.com/';
        let path = '/posts/10';
        let url = html5History.getUrl(baseHref, path);
        assert.equal(url, 'http://mysite.com/posts/10');
    });

    it('Should get url from url', () => {
        let baseHref = 'http://mysite.com/';
        let url = html5History.getUrl(baseHref, 'http://mysite.com/posts/10');
        assert.equal(url, 'http://mysite.com/posts/10');
    });

    it('Should get path from path', () => {
        let baseHref = 'http://mysite.com/';
        let result = getPathOnly(baseHref, '/posts/10');
        assert.equal(result, '/posts/10');
    });

    it('Should get path from url', () => {
        let baseHref = 'http://mysite.com/';
        let result = getPathOnly(baseHref, 'http://mysite.com/posts/10');
        assert.equal(result, '/posts/10');
    });


});

