import { assert } from 'chai';
import { RouteConfig } from '../../src/RouteConfig';

describe('RouteConfig tests', () => {

    it('Should have children', () => {
        let route = new RouteConfig({
            name: 'a', path: '/a', children: [
                { name: 'a.a', path: '' }, //    /a
                { name: 'a.b', path: '/:id' }, //   /a/10
            ]
        });

        assert.equal(Object.keys(route.children).length, 2);
        assert.equal(route.children['a.a'].name, 'a.a');
        assert.equal(route.children['a.a'].path, '/a');
        assert.equal(route.children['a.b'].name, 'a.b');
        assert.equal(route.children['a.b'].path, '/a/:id');
    });

    it('Should format path and children path', () => {
        let route = new RouteConfig({
            name: 'a', path: 'a', children: [
                { name: 'a.b', path: ':id' }, //   /a/10
            ]
        });
        assert.equal(route.children['a.b'].path, '/a/:id');
    });

    it('Should have parents', () => {
        let route = new RouteConfig({
            name: 'a', path: 'a', children: [
                {
                    name: 'a.b', path: ':id', children: [
                        { name: 'a.b.c', path: 'child' }
                    ]
                }
            ]
        });

        let resolved = route.children['a.b'].children['a.b.c'];
        // console.log(resolved);
        assert.equal(resolved.parent.name, 'a.b');
        assert.equal(resolved.parent.parent.name, 'a');
        assert.equal(resolved.parents[0].name, 'a');
        assert.equal(resolved.parents[1].name, 'a.b');
    });

    it('Should have root', () => {
        let route = new RouteConfig({
            name: 'a', path: 'a', children: [
                {
                    name: 'a.b', path: ':id', children: [
                        { name: 'a.b.c', path: 'child' }
                    ]
                }
            ]
        });
        let resolved = route.children['a.b'].children['a.b.c'];
        assert.equal(resolved.root.name, 'a');
    });

});
