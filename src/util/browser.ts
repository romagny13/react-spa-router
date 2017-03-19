export const inBrowser = typeof window !== 'undefined';
export const supportHistory = inBrowser && (function () {
    let userAgent = window.navigator.userAgent;

    if ((userAgent.indexOf('Android 2.') !== -1 || userAgent.indexOf('Android 4.0') !== -1)
        && userAgent.indexOf('Mobile Safari') !== -1
        && userAgent.indexOf('Chrome') === -1
        && userAgent.indexOf('Windows Phone') === -1
    ) {
        return false;
    }

    return window.history && 'pushState' in window.history;
})();
