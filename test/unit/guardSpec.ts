import { assert } from 'chai';
import { Guard, CanActivate, CanDeactivate } from '../../src/Guard';

/*
Should resolve 'CanActivate' route hooks with class that implements CanActivate interface
Should resolve 'CanActivate' route hooks with function
Should resolve 'CanDeactivate' route hooks that implements CanDeactivate interface
Should resolve 'CanDeactivate' route hooks with function
Should check can Activate
Should check can Deactivate
Should approve
*/

let guard: Guard,
    fakeRoute,
    routeWithClass,
    routeWithChildren,
    routeWithInjected,
    subscriberActivateChildClass,
    subscriberActivateClass,
    subscriberDeactivateClass,
    canContinueActivateChildClass = true,
    canContinueActivateClass = true,
    canContinueDeactivateClass = true;

class TestGuard implements CanActivate, CanDeactivate {
    canActivateChild(childRoute, next) {
        if (subscriberActivateChildClass) { subscriberActivateChildClass(childRoute); }
        next(canContinueActivateChildClass);
    }
    canActivate(route, next) {
        if (subscriberActivateClass) { subscriberActivateClass(route); }
        next(canContinueActivateClass);
    }

    canDeactivate(activeVms, route, next) {
        if (subscriberDeactivateClass) { subscriberDeactivateClass(route); }
        next(canContinueDeactivateClass);
    }
}

function getChildRoute(childName, parent) {
    for (let i = 0; i < parent.children.length; i++) {
        let child = parent.children[i];
        if (child.name === childName) {
            return child;
        }
    }
}

describe('Guard tests', () => {

    before(() => {
        guard = new Guard();
        fakeRoute = { name: '/fakeroute' };

        routeWithClass = { name: '/classroute', matched: { path: '/classroute', canActivate: [TestGuard], canDeactivate: [TestGuard] } };

        routeWithChildren = { name: '/parent', canActivateChild: [TestGuard] };
        routeWithChildren.children = [
            { name: 'index', path: '', matched: { root: routeWithChildren } },
            { name: 'detail', path: ':id', matched: { root: routeWithChildren } }
        ];
    });

    after(() => {
        guard = undefined;
    });

    /* Class */
    it('Should activate with class', (done) => {
        canContinueActivateClass = true;
        guard.checkCanActivate(routeWithClass, (canContinue) => {
            assert.isTrue(canContinue);
            done();
        });
    });

    it('Should cancel activate with class', (done) => {
        canContinueActivateClass = false;
        guard.checkCanActivate(routeWithClass, (canContinue) => {
            assert.isFalse(canContinue);
            done();
        });
    });

    it('Should activate child', (done) => {
        canContinueActivateChildClass = true;
        let childRoute = getChildRoute('detail', routeWithChildren);
        guard.checkCanActivate(childRoute, (canContinue) => {
            assert.isTrue(canContinue);
            done();
        });
    });

    it('Should cancel activate child', (done) => {
        canContinueActivateChildClass = false;
        let childRoute = getChildRoute('detail', routeWithChildren);
        guard.checkCanActivate(childRoute, (canContinue) => {
            assert.isFalse(canContinue);
            done();
        });
    });

    it('Should deactivate with class', (done) => {
        canContinueDeactivateClass = true;
        guard.checkCanDeactivate(routeWithClass, fakeRoute, {}, (canContinue) => {
            assert.isTrue(canContinue);
            done();
        });
    });

    it('Should cancel deactivate with class', (done) => {
        canContinueDeactivateClass = false;
        guard.checkCanDeactivate(routeWithClass, fakeRoute, {}, (canContinue) => {
            assert.isFalse(canContinue);
            done();
        });
    });


    /* infos */
    it('Guard receive infos on activate', (done) => {
        canContinueActivateClass = true;
        subscriberActivateClass = (route) => {
            assert.equal(route.name, '/classroute');
            subscriberActivateClass = undefined;
            done();
        };
        guard.checkCanActivate(routeWithClass, (canContinue) => {

        });
    });

    it('Should receive infos on activate child', (done) => {
        canContinueActivateChildClass = true;
        let childRoute = getChildRoute('detail', routeWithChildren);

        subscriberActivateChildClass = (route) => {
            assert.equal(route.name, 'detail');
            subscriberActivateChildClass = undefined;
            done();
        };
        guard.checkCanActivate(childRoute, (canContinue) => {

        });
    });

    it('Guard receive infos on deactivate', (done) => {
        canContinueDeactivateClass = true;
        subscriberDeactivateClass = (route) => {
            assert.equal(route.name, '/fakeroute');
            subscriberDeactivateClass = undefined;
            done();
        };
        canContinueDeactivateClass = true;
        guard.checkCanDeactivate(routeWithClass, fakeRoute, {}, (canContinue) => {

        });
    });

    /** resolve */
    it('Should resolve and activate', (done) => {
        canContinueActivateClass = true;
        canContinueDeactivateClass = true;
        guard.approve(routeWithClass, routeWithClass, {}, (canActivate) => {
            assert.isTrue(canActivate);
            done();
        });
    });

    it('Should cancel on deactivate', (done) => {
        canContinueActivateClass = true;
        canContinueDeactivateClass = false;
        guard.approve(routeWithClass, routeWithClass, {}, (canDeactivate) => {
            assert.isFalse(canDeactivate);
            done();
        });
    });

    it('Should cancel on activate', (done) => {
        canContinueActivateClass = false;
        canContinueDeactivateClass = true;
        guard.approve(routeWithClass, routeWithClass, {}, (canActivate) => {
            assert.isFalse(canActivate);
            done();
        });
    });

});
