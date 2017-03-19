import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isFunction, isBoolean, isString, doLater } from '../util';
import { Router } from '../Router';
import { routerMessenger } from '../RouterMessenger';
import { Route } from '../Route';

export function viewRender(component, viewName?) {
    if (!isString(viewName)) { viewName = 'default'; }
    routerMessenger.publish(viewName, component);
}

export class RouterView extends React.Component<any, any> {
    _component: any;
    _enterTimer: any;
    _leaveTimer: any;
    _isAnimating: boolean;
    _firstTime: boolean;
    static defaultProps = {
        name: 'default'
    };
    constructor(props) {
        super(props);
        this.state = {
            previous: null,
            current: null
        };
        this._firstTime = true;
    }

    _preventAnimation() {
        if (this._isAnimating) {
            clearTimeout(this._leaveTimer);
            clearTimeout(this._enterTimer);
            this.setState({
                previous: null,
                previousClassName: null,
                current: this._component,
                currentClassName: 'router-page current'
            });
            this._isAnimating = false;
        }
    }

    componentDidMount() {
        routerMessenger.subscribe(this.props.name, (component) => {
            let self = this,
                leave = this.props.leave,
                leaveTimeout = this.props.leaveTimeout,
                enter = this.props.enter,
                enterTimeout = this.props.enterTimeout,
                simultaneous = this.props.simultaneous,
                count = 0;

            function checkAnimationEnd() {
                count++;
                if (count === 2) {
                    self._isAnimating = false;
                }
            }

            if (this._firstTime || (!enter && !leave)) {
                // no animation
                this.setState({
                    current: component,
                    currentClassName: 'router-page current'
                });
                this._firstTime = false;
            }
            else {
                if (simultaneous) {
                    this._preventAnimation();

                    doLater(() => {
                        this._component = component;
                        this._isAnimating = true;

                        let previous = this.state.current;
                        this.setState({
                            previous,
                            previousClassName: 'router-page ' + leave + ' current',
                            current: component,
                            currentClassName: 'router-page ' + enter
                        });

                        // leave
                        this._leaveTimer = setTimeout(() => {
                            this.setState({
                                previous: null
                            });
                            checkAnimationEnd();
                        }, leaveTimeout);

                        // enter
                        this._enterTimer = setTimeout(() => {
                            this.setState({
                                currentClassName: 'router-page current'
                            });
                            checkAnimationEnd();
                        }, enterTimeout);
                    });
                }
                else {
                    /*
                        .router-page  |  .fadeIn            |  .current
                        opacity = 0   |  transition 0 => 1  |  opacity = 1
                    */
                    this._preventAnimation();

                    doLater(() => {
                        this._component = component;
                        this._isAnimating = true;

                        // leave
                        this.setState({
                            currentClassName: 'router-page ' + leave + ' current'
                        });

                        this._leaveTimer = setTimeout(() => {
                            this.setState({
                                current: component,
                                currentClassName: 'router-page ' + enter
                            });

                            this._enterTimer = setTimeout(() => {
                                // enter
                                this.setState({
                                    currentClassName: 'router-page current'
                                });
                                this._isAnimating = false;
                            }, enterTimeout);
                        }, leaveTimeout);
                    });
                }
            }
        });
    }
    render() {
        return (
            <div id={this.props.id} className={this.props.className} style={this.props.style}>
                {this.state.current ? <div className={this.state.currentClassName} style={{ position: 'relative' }}>{this.state.current}</div> : null}
                {this.state.previous ? <div className={this.state.previousClassName}>{this.state.previous}</div> : null}
            </div>
        );
    }
}