import { assert } from 'chai';
import { Activator } from '../../src/Activator';

describe('Activator', () => {

    let activator: Activator;
    class VM {
        data = 'my vm';
    }

    before(() => {
        activator = new Activator();
    });

    after(() => {
        activator.clear();
    });

    it('Should create new instance', () => {
        let result = activator.getInstance(VM);
        result.data = 'updated';
        assert.isTrue(result instanceof VM);
    });

    it('Should cache instance', () => {
        let result = activator.getInstance(VM);
        assert.equal(result.data, 'updated');
    });

    it('Should get new instance', () => {
        let result = activator.getNewInstance(VM);
        assert.equal(result.data, 'my vm');
    });

});
