import { assert } from 'chai';
import { Router, routes, clearRoutesInternal } from '../../src/Router';

describe('Router tests', function () {

    let router: Router,
        successSubscriber,
        base: HTMLElement;

    function onRouteChangeSuccess(route) {
        if (successSubscriber) { successSubscriber(route); }
    }

    before(() => {
        base = document.createElement('base');
        base.setAttribute('href', window.location.href);
        document.head.appendChild(base);
    });

    after(() => {
        base.parentElement.removeChild(base);
        history.pushState('', document.title, window.location.pathname + window.location.search);
        clearRoutesInternal();
    });

    it('Should configure', () => {
        router = new Router({
            scroll: false,
            routes: [
                { name: 'home', path: '/', action: () => { } },
                { name: 'a', path: '/a/:a/:b', action: () => { } },
                { name: 'b', path: '/b', action: () => { } },
                { name: 'c', path: '/c', action: () => { } },
            ]
        });
        assert.isFalse(router._scroll);
    });

    it('Should add routes', () => {
        assert.isDefined(routes['a']);
        assert.isDefined(routes['b']);
    });

    it('Should load', (done) => {
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'home');
            successSubscriber = undefined;
            done();
        };
        router.run(onRouteChangeSuccess);
    });

    it('Should navigate to', (done) => {
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'b');
            successSubscriber = undefined;
            done();
        };
        router.navigateTo('b');
    });

    it('Should go back', (done) => {
        // back to route home
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'home');
            successSubscriber = undefined;
            done();
        };
        router.goBack();
    });

    it('Should go forward', (done) => {
        // forward to 404
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'b');
            successSubscriber = undefined;
            done();
        };
        router.goForward();
    });


    it('Should navigate by url', (done) => {
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'a');
            assert.equal(route.path, '/a/10/20');
            assert.equal(route.params.a, 10);
            assert.equal(route.params.b, 20);
            assert.equal(route.query.q, 'abc');
            assert.equal(route.query.cat, '10');
            assert.equal(route.fragment, '#section1');
            successSubscriber = undefined;
            done();
        };
        router.navigateToUrl('/a/10/20?q=abc&cat=10#section1');
    });

    it('Should replace', (done) => {
        // replace route a by 404
        successSubscriber = (route) => {
            assert.equal(route.matched.name, 'home');
            successSubscriber = undefined;
            done();
        };
        router.replace('home');
    });

    it('Should call before each and after each', (done) => {

        let beforeCalled = false;
        router.beforeEach((next) => {
            beforeCalled = true;
            next();
        });

        router.afterEach(() => {
            assert.isTrue(beforeCalled);
            done();
        });

        router.navigateTo('home');
    });

    it('Should control with before each', (done) => {
        let beforeCalled = false;
        router.beforeEach((next) => {
            beforeCalled = true;
        });

        router.afterEach(() => {
            assert.fail();
        });

        router.navigateTo('home');
        setTimeout(function () {
            assert.isTrue(beforeCalled);
            done();
        }, 500);
    });

});


