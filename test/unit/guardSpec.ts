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
    routeWithInjected,
    subscriberActivateClass,
    subscriberDeactivateClass,
    canContinueActivateClass = true,
    canContinueDeactivateClass = true;

class TestGuard implements CanActivate, CanDeactivate {
    canActivate(route, next) {
        if (subscriberActivateClass) { subscriberActivateClass(route); }
        next(canContinueActivateClass);
    }

    canDeactivate(activeVms, route, next) {
        if (subscriberDeactivateClass) { subscriberDeactivateClass(route); }
        next(canContinueDeactivateClass);
    }
}

describe('Guard tests', () => {

    before(() => {
        guard = new Guard();
        fakeRoute = { name: '/fakeroute' };

        routeWithClass = { name: '/classroute', matched: { path: '/classroute', canActivate: [TestGuard], canDeactivate: [TestGuard] } };
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
