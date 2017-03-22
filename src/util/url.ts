export function trimBase(base, url) {
    /*
    BASE                                | HOME
    - http://mysite.com (origin)        | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
    - http://mysite.com/ (base tag)     | http://mysite.com/ or http://mysite.com/#/                        | http://mysite.com/posts/10 or http://mysite.com/#/posts/10
    - http://mysite.com/blog            | http://mysite.com/blog                                            | http://mysite.com/blog/posts/10 or http://mysite.com/blog/#/posts/10
    - http://mysite.com/index.html      | http://mysite.com/index.html or http://mysite.com/index.html#/    | http://mysite.com/index.html#/posts/10
                                        => '' or '/' or '/#/' or '#/' ==> '/'                                => 'posts/10' or  '/#/posts/10' or '#/posts/10' ==> '/posts/10'
    */
    let fullPath = url.replace(base, '');
    if (fullPath === '') {
        return '/';
    }
    else {
        // remove # or /#
        fullPath = fullPath.replace(/^(\/#|#)/, '');
        // add /
        if (fullPath.charAt(0) !== '/') { fullPath = '/' + fullPath; }
        return fullPath;
    }
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


export function getPathOnly(base, url) {
    // full path
    let path = trimBase(base, url);
    // trim query and fragment
    return trimQueryAndFragment(path);
}