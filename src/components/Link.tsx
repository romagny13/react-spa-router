import * as React from 'react';
import { isString, isObject, trimBase, convertToPathString, convertToFullPathString, getBase } from '../util';
import { routerHistory, routes } from '../Router';
import { HashHistory } from '../HashHistory';
import { trimQueryAndFragment } from '../util/url';

export function checkIsActive(fullCurrentPathString, fullLinkPathString, exact?: boolean, activePattern?: any): boolean {
    let isActive;
    if (activePattern) {
        return activePattern.test(fullCurrentPathString);
    }
    else {
        // exact by default
        if (exact) {
            // => compare all full link path string with full current path
            return fullCurrentPathString === fullLinkPathString;
        }
        else {
            // => compare link path without query and fragment with current path
            let linkPath = trimQueryAndFragment(fullLinkPathString);
            return fullCurrentPathString.indexOf(linkPath) !== -1;
        }
    }
}

export function getClassName(isActive, className, activeClassName) {
    if (isActive && activeClassName) {
        return className && className !== '' ? className + ' ' + activeClassName : activeClassName;
    }
    else {
        return className;
    }
}

export function getFullLinkPathString(to: any) {
    if (isString(to)) {
        return to;
    }
    else if (isObject(to)) {
        if (to.name) {
            let route = routes[to.name];
            if (route) {
                let path = convertToPathString(route.path, to.params);
                return convertToFullPathString(path, to.query, to.fragment);
            }
        }
        else if (to.path) {
            return convertToFullPathString(to.path, to.query, to.fragment);
        }
    }
    throw new Error('Cannot resolve link \'to\'');
}

export function getFullCurrentPathString(base) {
    return trimBase(base, window.location.href);
}

export class Link extends React.Component<any, any> {
    static defaultProps = {
        exact: true
    };
    _base: string;
    _linkHref: any;
    _fullLinkPathString: string;
    constructor(props) {
        super(props);
        this._base = getBase();
        this._fullLinkPathString = getFullLinkPathString(this.props.to);
        this._linkHref = routerHistory && routerHistory instanceof HashHistory ? '#' + this._fullLinkPathString : this._fullLinkPathString;

        let fullCurrentPathString = getFullCurrentPathString(this._base);
        let isActive = this.props.activeClassName ?
            checkIsActive(fullCurrentPathString, this._fullLinkPathString, this.props.exact, this.props.activePattern)
            : false;
        this.state = {
            isActive
        };
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        routerHistory.subscribe((route) => {
            if (this.props.activeClassName) {
                let fullCurrentPathString = getFullCurrentPathString(this._base);
                let isActive = checkIsActive(fullCurrentPathString, this._fullLinkPathString, this.props.exact, this.props.activePattern);
                this.setState({
                    isActive
                });
            }
        });
    }

    onClick(event) {
        event.preventDefault();
        routerHistory.go(this._fullLinkPathString);
    }

    render() {
        let className = getClassName(this.state.isActive, this.props.className, this.props.activeClassName);
        if (this.props.tag) {
            let props = { id: this.props.id, href: this._linkHref, onClick: this.onClick, className: this.props.className, style: this.props.style };
            return React.createElement(this.props.tag, { className }, React.createElement('a', props, this.props.children));
        }
        else {
            let props = { id: this.props.id, href: this._linkHref, onClick: this.onClick, className, style: this.props.style };
            return React.createElement('a', props, this.props.children);
        }
    }
}
