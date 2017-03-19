export function getOrigin() {
    return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

export function getBase() {
    let base = document.querySelector('base');
    return base ? base.href : getOrigin();
}
