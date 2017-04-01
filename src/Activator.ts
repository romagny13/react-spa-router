import { isFunction } from './util';

export function getFunctionName(fn) {
    return fn.name || fn.toString().match(/^function\s*([^\s(]+)/)[1];
}

export class Activator {
    private cache: any;
    constructor() {
        this.cache = {};
    }

    clear() {
        this.cache = {};
    }

    getNewInstance(ctor: any): any {
        if (isFunction(ctor)) {
            let name = getFunctionName(ctor);
            let instance = new ctor();
            this.cache[name] = instance;
            return instance;
        }
        else { throw TypeError('Invalid type. Require a function / class'); }
    }

    getInstance(ctor: any): any {
        if (isFunction(ctor)) {
            let name = getFunctionName(ctor);
            if (this.cache.hasOwnProperty(name)) {
                return this.cache[name];
            }
            else {
                return this.getNewInstance(ctor);
            }
        }
        else { throw TypeError('Invalid type. Require a function / class'); }
    }
}

export const activator = new Activator();