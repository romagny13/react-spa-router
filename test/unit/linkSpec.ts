import { assert } from 'chai';
import { getClassName, getFullLinkPathString, checkIsActive } from '../../src/components/Link';

describe('Link', () => {

    it('Should resolve link url with to string', () => {
        let to = '/posts';
        let result = getFullLinkPathString(to);
        assert.equal(result, to);
    });

    it('Should resolve link url with object', () => {
        let to = { path: '/posts/10', query: { q: 'abc', cat: 10 }, fragment: 'section1' };
        let result = getFullLinkPathString(to);
        assert.equal(result, '/posts/10?q=abc&cat=10#section1');
    });

    it('Should get className', () => {
        let result = getClassName(false, 'my-class', 'active');
        assert.equal(result, 'my-class');
    });

    it('Should get active className', () => {
        let result = getClassName(true, 'my-class', 'active');
        assert.equal(result, 'my-class active');
    });

    it('Should check active', () => {
        let isActive = checkIsActive('/posts/10', '/posts/10');
        assert.isTrue(isActive);
    });

    it('Should check not active', () => {
        let isActive = checkIsActive('/about', '/posts/10');
        assert.isFalse(isActive);
    });

    it('Should check active and ignore query and fragment', () => {
        let isActive = checkIsActive('/posts/10?q=abc&cat=10#section1', '/posts/10');
        assert.isTrue(isActive);
    });

    it('Should check no active and not ignore query and fragment with exact', () => {
        let isActive = checkIsActive('/posts/10?q=abc&cat=10#section1', '/posts/10', true);
        assert.isFalse(isActive);
    });

    it('Should check active with pattern', () => {
        let regex = /\/posts\/[0-9]+/;
        let isActive = checkIsActive('/posts/500', '/posts/10', null, regex);
        assert.isTrue(isActive);
    });
});