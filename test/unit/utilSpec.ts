import { convertToFullPathString } from '../../src/util';
import { assert } from 'chai';
import { convertToQueryString, formatFragment, convertToPathString } from '../../src/util/path';
import { getBase } from '../../src/util/location';
import { trimBase, trimQueryAndFragment } from '../../src/util/url';
import { scrollToElement } from '../../src/util/dom';

describe('Utils', () => {

    describe('Path', () => {
        it('Should convert query to query string', () => {
            let query = {
                q: 'abc'
            };
            let result = convertToQueryString(query);
            assert.equal(result, '?q=abc');
        });

        it('Should convert query with multiple values', () => {
            let query = {
                q: 'abc',
                cat: '10'
            };
            let result = convertToQueryString(query);
            assert.equal(result, '?q=abc&cat=10');
        });

        it('Should add missing hash to fragment', () => {
            let fragment = 'section1';
            let result = formatFragment(fragment);
            assert.equal(result, '#section1');
        });

        it('Should format fragment', () => {
            let fragment = '#section1';
            let result = formatFragment(fragment);
            assert.equal(result, '#section1');
        });

        it('Should convert path and params object to path string', () => {
            let path = '/posts/:id';
            let params = {
                id: 10
            };
            let result = convertToPathString(path, params);
            assert.equal(result, '/posts/10');
        });

        it('Should convert path and params object to path string with multiple params', () => {
            let path = '/posts/:a/other/:c/:b';
            let params = {
                a: 10,
                b: 20,
                c: 30
            };
            let result = convertToPathString(path, params);
            assert.equal(result, '/posts/10/other/30/20');
        });

        it('Should convert path and query and fragment to full path string', () => {
            let path = '/posts/10';
            let query = {
                q: 'abc',
                cat: '10'
            };
            let fragment = 'section1';
            let result = convertToFullPathString(path, query, fragment);
            assert.equal(result, '/posts/10?q=abc&cat=10#section1');
        });

        it('Should convert path (without query) and fragment to full path string', () => {
            let path = '/posts/10';
            let fragment = 'section1';
            let result = convertToFullPathString(path, undefined, fragment);
            assert.equal(result, '/posts/10#section1');
        });

        it('Should convert path and query to full path string', () => {
            let path = '/posts/10';
            let query = {
                q: 'abc',
                cat: '10'
            };
            let result = convertToFullPathString(path, query);
            assert.equal(result, '/posts/10?q=abc&cat=10');
        });

    });

    describe('Base', () => {

        let base: HTMLElement;
        before(() => {
            base = document.createElement('base');
            base.setAttribute('href', 'http://localhost/test');
        });

        after(() => {
            base.parentElement.removeChild(base);
        });

        it('Should get origin', () => {
            let result = getBase();
            assert.equal(result, window.location.origin);
        });

        it('Should get base tag href', (done) => {
            document.head.appendChild(base);

            setTimeout(() => {
                let result = getBase();
                assert.equal(result, 'http://localhost/test');
                done();
            });
        });
    });

    describe('Url', () => {
        /*
              BASE                                | HOME
              - http://mysite.com (origin)        | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
              - http://mysite.com/ (base tag)     | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
              - http://mysite.com/blog            | http://mysite.com/blog                                            | http://mysite.com/blog/posts/10 or http://mysite.com/blog/#/posts/10
              - http://mysite.com/index.html      | http://mysite.com/index.html or http://mysite.com/index.html#/    | http://mysite.com/index.html#/posts/10
                                                  => '' or '/' or '/#/' or '#/' ==> '/'                                => 'posts/10' or '#/posts/10' ==> '/posts/10'
        */
        it('Should trim base with no end slash', () => {
            let result = trimBase('http://mysite.com', 'http://mysite.com/');
            assert.equal(result, '/');
        });

        it('Should trim base with end slash', () => {
            let result = trimBase('http://mysite.com/', 'http://mysite.com/');
            assert.equal(result, '/');
        });

        it('Should trim base with no end slash (base) and  #/ (url)', () => {
            let result = trimBase('http://mysite.com', 'http://mysite.com/#/');
            assert.equal(result, '/');
        });

        it('Should trim base with end #/', () => {
            let result = trimBase('http://mysite.com/', 'http://mysite.com/#/');
            assert.equal(result, '/');
        });

        it('Should trim base with pathname', () => {
            let result = trimBase('http://mysite.com/blog', 'http://mysite.com/blog');
            assert.equal(result, '/');
        });

        it('Should trim base with file + extension', () => {
            let result = trimBase('http://mysite.com/index.html', 'http://mysite.com/index.html');
            assert.equal(result, '/');
        });

        it('Should trim base with no end slash (base) and return /posts/10', () => {
            let result = trimBase('http://mysite.com', 'http://mysite.com/posts/10');
            assert.equal(result, '/posts/10');
        });

        it('Should trim base with end slash (base) and return /posts/10', () => {
            let result = trimBase('http://mysite.com/', 'http://mysite.com/posts/10');
            assert.equal(result, '/posts/10');
        });

        it('Should trim base with no end slash (base) + hash (url) and return /posts/10', () => {
            let result = trimBase('http://mysite.com', 'http://mysite.com/#/posts/10');
            assert.equal(result, '/posts/10');
        });

        it('Should trim base with end slash (base) + hash (url) and return /posts/10', () => {
            let result = trimBase('http://mysite.com/', 'http://mysite.com/#/posts/10');
            assert.equal(result, '/posts/10');
        });

        it('Should trim base with file + extension + hash (url) and return /posts/10', () => {
            let result = trimBase('http://mysite.com/index.html', 'http://mysite.com/index.html#/posts/10');
            assert.equal(result, '/posts/10');
        });

        it('Should get base tag href', () => {
            let result = trimBase('http://localhost/test', 'http://localhost/test/posts');
            assert.equal(result, '/posts');
        });

        it('Should trim query', () => {
            let url = 'http://localhost/test/posts/10?q=abc&cat=10#section1';
            let result = trimQueryAndFragment(url);
            assert.equal(result, 'http://localhost/test/posts/10');
        });

        it('Should trim fragment', () => {
            let url = 'http://localhost/test/posts/10#section1';
            let result = trimQueryAndFragment(url);
            assert.equal(result, 'http://localhost/test/posts/10');
        });

    });

    /*  describe('Scroll', () => {
  
          let separator,
              anchor;
          before(() => {
              separator = document.createElement('div');
              separator.style = 'height:5000px';
              document.body.appendChild(separator);
  
              anchor = document.createElement('div');
              anchor.setAttribute('id', 'section1');
              document.body.appendChild(anchor);
          });
  
          after(() => {
              separator.parentElement.removeChild(separator);
              anchor.parentElement.removeChild(anchor);
          });
  
          it('Should scroll to fragment', () => {
              scrollToElement('#section1');
              setTimeout(() => {
                  let elRect = anchor.getBoundingClientRect();
                  assert.isTrue(elRect.top > 5000);
              }, 500);
          });
  
      });*/

});