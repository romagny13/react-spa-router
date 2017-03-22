import { assert } from 'chai';
import { addRoutesInternal, clearRoutesInternal } from '../../src/Router';
import { HashHistory } from '../../src/HashHistory';
import { getPathOnly } from '../../src/util/url';

/*
Should notify on load
Should notify on hashchange (back,forward, user url changes)
Should notify on link click
Should notify on route link click
Should notify on go (navigate programmatically)
Should notify on replace
Should get route infos
// Guards
Should cancel before navigating
Should reset url on cancel after url changed
*/

describe('Hash history', () => {
    let hashHistory: HashHistory,
        subscriber,
        link,
        guardState = 'passing',
        guardCallback,
        base: HTMLElement;
    function onUrlChanged(e) {
        if (!subscriber) { throw new Error('Subscriber not found for Hash tests'); }
        subscriber(e);
    }

    class MyGuard {
        canActivate(to, next) {
            next(false);
        }
    }

    before(() => {
        base = document.createElement('base');
        base.setAttribute('href', window.location.href);
        document.head.appendChild(base);

        link = document.createElement('a');
        link.setAttribute('href', '#/link');
        document.body.appendChild(link);

        addRoutesInternal([
            { name: 'home', path: '/' },
            { name: 'hashchange', path: '/hashchange' },
            { name: 'go', path: '/go' },
            { name: 'replace', path: '/replace' },
            { name: 'link', path: '/link' },
            { name: 'post-details', path: '/posts/:id' },
            { name: 'canceled', path: '/canceled', canActivate: [MyGuard] },
            { name: 'redirect', path: '**', redirectTo: '/' }
        ]);
        hashHistory = new HashHistory();
    });

    after(() => {
        base.parentElement.removeChild(base);
        link.parentElement.removeChild(link);
        window.history.replaceState(null, document.title, hashHistory.base);
        subscriber = null;
        guardCallback = null;
        hashHistory = null;
        clearRoutesInternal();
    });

    it('Should notify on load', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'home');
            done();
        };
        hashHistory.subscribe(onUrlChanged);
        hashHistory.run();
    });

    it('Should notify on hash change', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'hashchange');
            done();
        };
        window.location.hash = '#/hashchange';
    });

    it('Should notify on go', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'go');
            done();
        };
        hashHistory.go('/go');
    });

    it('Should go back', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'hashchange');
            done();
        };
        hashHistory.back();
    });

    it('Should go forward', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'go');
            done();
        };
        hashHistory.forward();
    });

    it('Should notify on click link', function (done) {
        this.timeout(5000);
        subscriber = function (route) {
            assert.equal(route.matched.name, 'link');
            done();
        };
        link.click();
    });

    it('Should notify on replace', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'replace');
            done();
        };
        hashHistory.replace('/replace');
    });

    it('Should cancel and reset after url changed', (done) => {
        subscriber = function () { };
        window.location.hash = '#/canceled';
        setTimeout(function () {
            assert.equal(window.location.hash, '#/replace');
            done();
        }, 1000);
    });

    it('Should redirect', (done) => {
        subscriber = function (route) {
            assert.equal(route.matched.name, 'home');
            done();
        };
        hashHistory.redirectTo('/');
    });

    it('Should get route infos', (done) => {
        subscriber = function (route) {
            assert.equal(route.path, '/posts/10');
            assert.equal(route.params.id, 10);
            assert.equal(route.query.q, 'abc');
            assert.equal(route.query.cat, '10');
            assert.equal(route.fragment, '#section1');
            done();
        };
        window.location.hash = '#/posts/10?q=abc&cat=10#section1';
    });

    it('Should set route programmatically', (done) => {
        subscriber = function (route) {
            assert.equal(route.path, '/posts/100');
            assert.equal(route.params.id, 100);
            assert.equal(route.query.q, 'efg');
            assert.equal(route.query.cat, '20');
            assert.equal(route.fragment, '#section2');
            done();
        };
        hashHistory.go('/posts/100?q=efg&cat=20#section2');
    });

    it('Should get url from path', () => {
        let baseHref = 'http://mysite.com/';
        let path = '/posts/10';
        let url = hashHistory.getUrl(baseHref, path);
        assert.equal(url, 'http://mysite.com/#/posts/10');
    });

    it('Should get url from url', () => {
        let baseHref = 'http://mysite.com/';
        let url = hashHistory.getUrl(baseHref, 'http://mysite.com/#/posts/10');
        assert.equal(url, 'http://mysite.com/#/posts/10');
    });

    it('Should get path from path', () => {
        let baseHref = 'http://mysite.com/';
        let result = getPathOnly(baseHref, '/posts/10');
        assert.equal(result, '/posts/10');
    });

    it('Should get path from url', () => {
        let baseHref = 'http://mysite.com/';
        let result = getPathOnly(baseHref, 'http://mysite.com/#/posts/10');
        assert.equal(result, '/posts/10');
    });
});

