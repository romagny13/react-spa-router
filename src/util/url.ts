export function trimBase(base, url: string) {
    // base => http://localhost:3000
    // url => http://localhost:3000/posts/10?q=mysearch#section1
    // return => /posts/10?q=mysearch#section1
    return url.replace(base, '');
}

export function trimQueryAndFragment(url) {
    if (url.indexOf('?') !== -1) {
        // remove query string
        url = url.split('?')[0];
    }
    else if (url.indexOf('#') !== -1) {
        // remove fragment
        url = url.split('#')[0];
    }
    return url;
}
