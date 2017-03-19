import { assert } from 'chai';
import { RouteConfig } from '../../src/RouteConfig';
import { RouteResolver, getMatched, getFragment, getQuery, getQueryString, getParams, match } from '../../src/RouteResolver';

/*
Should find matched route
Shoulduse regexes with params
Should get params of with matched route
Should get query object of with matched route
Should build url with a route + parameters
*/

describe('RouteResolver tests', () => {

    let routes,
        routeResolver: RouteResolver;

    before(() => {
        routeResolver = new RouteResolver();
        routes = {};
        routes['a'] = new RouteConfig({
            name: 'a', path: '/a',
            children: [
                { name: 'a.a', path: '' }, //    /a
                { name: 'a.b', path: '/:id' }, //   /a/10
                {
                    name: 'a.c', path: ':a([a-z]+)',
                    children: [
                        { name: 'a.c.a', path: 'child/:b' } //   /a/abc/child/20
                    ]
                },
            ],
        });
        routes['b'] = new RouteConfig({ name: 'b', path: '/b' });
        routes['/c'] = new RouteConfig({
            path: '/c',
            children: [
                { path: '' }, //    /a
                { path: '/:id' }, //   /a/10
                {
                    path: ':a([a-z]+)',
                    children: [
                        { path: 'child/:b' } //   /a/abc/child/20
                    ]
                },
            ],
        });
    });

    it('RouteConfig should match', () => {
        assert.isTrue(match('/posts', '/posts'));
    });

    it('RouteConfig should not match', () => {
        assert.isFalse(match('/posts', '/notmatch'));
    });

    it('RouteConfig with one parameter should match', () => {
        assert.isTrue(match('/posts/:id', '/posts/10'));
    });

    it('RouteConfig with multiple parameters should match', () => {
        assert.isTrue(match('/posts/:a/sub/:b/:c', '/posts/10/sub/20/30'));
    });

    it('RouteConfig with one parameter and regex should match', () => {
        assert.isTrue(match('/posts/:id([a-z]+)', '/posts/abc'));
    });

    it('RouteConfig with one parameter and regex should not match', () => {
        assert.isFalse(match('/posts/:id([a-z]+)', '/posts/10'));
    });

    it('RouteConfig with parameters and regexes should match', () => {
        assert.isTrue(match('/posts/:a([a-z]+)/sub/:b/:c([a-z]+-[0-9]+)', '/posts/abc/sub/20/prod-10'));
    });

    it('RouteConfig with parameters and regexes should not match', () => {
        assert.isFalse(match('/posts/:a([a-z]+)/sub/:b/:c([a-z]+-[0-9]+)', '/posts/abc/sub/20/30'));
    });

    it('Should get one parameter from url', () => {
        let parameter = getParams('/posts/:id', '/posts/10');
        assert.equal(parameter.id, 10);
    });

    it('Should get parameters from url', () => {
        let parameter = getParams('/posts/:a/sub/:b/:c', '/posts/10/sub/20/30');
        assert.equal(parameter.a, 10);
        assert.equal(parameter.b, 20);
        assert.equal(parameter.c, 30);
    });

    it('Should get one parameter with regex from url', () => {
        let parameter = getParams('/posts/:id([a-z]+)', '/posts/abc');
        assert.equal(parameter.id, 'abc');
    });

    it('Should get parameters with regexes from url', () => {
        let parameter = getParams('/posts/:a([a-z]+)/sub/:b/:c([a-z]+-[0-9]+)', '/posts/abc/sub/20/prod-10');
        assert.equal(parameter.a, 'abc');
        assert.equal(parameter.b, 20);
        assert.equal(parameter.c, 'prod-10');
    });

    it('Should get query from url', () => {
        let query = getQuery(getQueryString('http://mysite.com/posts?q=abc&cat=10'));
        assert.equal(query.q, 'abc');
        assert.equal(query.cat, '10');
    });

    it('Should get query from url with hash', () => {
        let query = getQuery(getQueryString('http://mysite.com/#/posts?q=abc&cat=10'));
        assert.equal(query.q, 'abc');
        assert.equal(query.cat, '10');
    });

    it('Should get fragment', () => {
        let url = 'http://mysite.com/#/posts/10?q=abc&cat=10#section1';
        let fragment = getFragment(url);
        assert.equal(fragment, '#section1');
    });

    it('Should not get fragment', () => {
        let url = 'http://mysite.com/#/posts/10?q=abc&cat=10';
        let fragment = getFragment(url);
        assert.equal(fragment, undefined);
    });

    it('Should find children', () => {
        let route = getMatched(routes, '/a/10');
        // console.log(route);
        assert.equal(route.name, 'a.b');
        assert.equal(route.parent.name, 'a');
    });

    it('Should resolve without name', () => {
        let route = routeResolver.resolve(routes, '/c/abc/child/20', 'http://mysite.com/c/abc/child/20');
        assert.equal(route.matched.path, '/c/:a([a-z]+)/child/:b');
        assert.equal(route.params['a'], 'abc');
        assert.equal(route.params['b'], 20);
        assert.equal(route.matched.parent.path, '/c/:a([a-z]+)');
        assert.equal(route.matched.root.path, '/c');
    });

    it('Should resolve default without name', () => {
        let route = routeResolver.resolve(routes, '/c', 'http://mysite.com/c');
        assert.equal(route.matched.path, '/c');
        assert.equal(route.matched.parent.path, '/c');
        assert.equal(route.matched.root.path, '/c');
    });

});


