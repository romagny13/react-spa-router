import { isUndefined, isFunction, isArray, isDefined } from './util';
import { Route } from './Route';
import { Router } from './Router';

export class RouterMessenger {
    _subscribers: any;
    _pending: any;
    constructor() {
        this._subscribers = {};
        this._pending = {};
    }

    clearPending() {
        this._pending = {};
    }

    subscribe(viewName: string, subscriber: Function) {
        if (!isArray(this._subscribers[viewName])) { this._subscribers[viewName] = []; }
        this._subscribers[viewName].push(subscriber);

        // pending
        if (this._pending.hasOwnProperty(viewName)) {
            this._subscribers[viewName].forEach((subscriber) => {
                subscriber(this._pending[viewName]);
            });
            delete this._pending[viewName];
        }
    }

    publish(viewName: string, component: any) {
        if (this._subscribers[viewName]) {
            this._subscribers[viewName].forEach((subscriber) => {
                subscriber(component);
            });
        }
        else {
            this._pending[viewName] =  component;
        }
    }
}

export const routerMessenger = new RouterMessenger();
