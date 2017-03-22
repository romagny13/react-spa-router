import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, setActiveComponent } from '../src/Router';
import { viewRender, RouterView } from '../src/components/RouterView';
import { Link } from '../src/components/Link';

class MyGuard {
    canActivate(from, to, next) {
        let result = confirm('Activate?');
        next(result);
    }
    canDeactivate(activeComponents, route, next) {
        let component = activeComponents['PostList'];
        let result = component && component.checkCanDeactivate ? component.checkCanDeactivate() : true;
        next(result);
    }
}

export const Home = (props) => {
    return (
        <div style={{ background: '#c0392b' }}>
            <h1>Home</h1>
        </div>
    );
};

export class PostList extends React.Component<any, any> {
    constructor(props) {
        super(props);
        // register component in order to access to checkCanDeactivate function with Guard
        setActiveComponent('PostList', this);
        this.state = {
            updated: true
        };
    }
    checkCanDeactivate() {
        console.log(this.state);
        return confirm('Leave without saving (Deactivate) ?');
    }
    render() {
        return (
            <div style={{ background: '#d35400' }}>
                <h1>Post list</h1>
            </div>
        );
    }
}

export class PostDetail extends React.Component<any, any> {
    render() {
        return (
            <div style={{ background: '#2980b9' }}>
                <h1>Post Id: {this.props.id}</h1>
            </div>
        );
    }
}

export class About extends React.Component<any, any> {
    render() {
        return (
            <div style={{ background: '#34495e' }}>
                <h1>About</h1>
            </div>
        );
    }
}

export class Customers extends React.Component<any, any> {
    render() {
        return (
            <div>
                <RouterView name='top' />
                <RouterView name='bottom' />
            </div>
        );
    }
}

export class CustomerList extends React.Component<any, any> {
    render() {
        return (
            <div>
                <h1>Customer list</h1>
            </div>
        );
    }
}

export class CustomerDetail extends React.Component<any, any> {
    render() {
        console.log('detail', this.props.id);
        let inner = this.props.id ? <p>Customer details</p> : <Link to='/customers/2'>Select a customer</Link>;
        return (
            <div>
                {inner}
            </div>
        );
    }
}

function doSomething() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('result 2');
            resolve('result 2');
        }, 3000);
    });
}

const routes = [
    { path: '/', action: () => viewRender(<Home />) },
    { path: '/posts', action: () => viewRender(<PostList />), canActivate: [MyGuard], canDeactivate: [MyGuard] },
    { path: '/posts/:id', action: ({ route }) => viewRender(<PostDetail id={route.params.id} />) },
    { name: 'about', path: '/about', action: () => viewRender(<About />) },
    {
        path: 'customers', action: () => viewRender(<Customers />, 'customers'),
        children: [
            {
                path: '',
                actions: [
                    () => viewRender(<CustomerList />, 'top'),
                    () => viewRender(<CustomerDetail />, 'bottom'),
                    ({ router }) => console.log('Activate customers', router)
                ]
            },
            {
                path: 'async',
                actions: [
                    () => {
                        // with promise
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                console.log('result 1');
                                resolve('result 1');
                            }, 1000);
                        });
                    },
                    async ({ result }) => {
                        console.log('receive result', result);
                        // with async await
                        return await doSomething();
                    },
                    ({ result }) => {
                        console.log('receive result', result);
                        // simple result
                        console.log('result 3');
                        return 'result 3';
                    },
                    ({ result }) => {
                        console.log('receive result', result);
                        // with promise
                        return new Promise((resolve) => {
                            throw 'Error result 4';
                        });
                    },
                    ({ result, error }) => {
                        console.log('receive error', error);
                        // with promise
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                console.log('result 5');
                                resolve('result 5');
                            }, 1000);
                        });
                    },
                    ({ result }) => console.log('Final result', result)
                ]
            },
            {
                path: ':id',
                actions: [
                    () => viewRender(<CustomerList />, 'top'),
                    ({ route }) => viewRender(<CustomerDetail id={route.params.id} />, 'bottom'),
                    ({ router, route }) => console.log('Activate customer detail', router, route)
                ]
            }]
    },
    { path: '**', redirectTo: '/' }
];

class App extends React.Component<any, any> {
    constructor(props) {
        super(props);

        const router = new Router({
            mode: 'history',
            routes
        }).run((route) => {
            // console.log(route);
        }, (err) => {
            console.warn('error', err);
        });

        this.state = {
            selectedValue: 'fxShuffle'
        };
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    onSelectionChange(event) {
        let selectedValue = event.target.value;
        this.setState({
            selectedValue
        });
    }

    render() {
        return (
            <div className='container'>
                <nav>
                    <ul>
                        <Link tag='li' to='/' activeClassName='active'>Home</Link>
                        <Link tag='li' to='/posts' activeClassName='active'>Post list</Link>
                        <Link tag='li' to='/posts/10' activeClassName='active'>Detail</Link>
                        <Link tag='li' to={{ path: '/posts/50', query: { q: 'mysearch' }, fragment: '#section1' }} activeClassName='active' activePattern={/\/posts\/[0-9]+/}>Query+fragment and active pattern</Link>
                        <Link tag='li' to='/customers' activeClassName='active' exact={false}>Customers</Link>
                        <Link tag='li' to='/customers/async' activeClassName='active' exact={false}>Async</Link>
                        {/* named route */}
                        <Link tag='li' to={{ name: 'about' }} activeClassName='active'>About</Link>
                    </ul>
                </nav>
                <section>
                    <div className='custom-select'>
                        <select onChange={this.onSelectionChange} value={this.state.selectedValue}>
                            <option value='-1'>Choose an effect...</option>
                            <option value='fxCorner'>Corner scale</option>
                            <option value='fxVScale'>Vertical scale</option>
                            <option value='fxFall'>Fall</option>
                            <option value='fxFPulse'>Forward pulse</option>
                            <option value='fxRPulse'>Rotate pulse</option>
                            <option value='fxHearbeat'>Hearbeat</option>
                            <option value='fxCoverflow'>Coverflow</option>
                            <option value='fxRotateSoftly'>Rotate me softly</option>
                            <option value='fxDeal'>Deal 'em</option>
                            <option value='fxFerris'>Ferris wheel</option>
                            <option value='fxShinkansen'>Shinkansen</option>
                            <option value='fxSnake'>Snake</option>
                            <option value='fxShuffle'>Shuffle</option>
                            <option value='fxPhotoBrowse'>Photo Browse</option>
                            <option value='fxSlideBehind'>Slide Behind</option>
                            <option value='fxVacuum'>Vacuum</option>
                            <option value='fxHurl'>Hurl it</option>
                        </select>
                    </div>
                    <div id='component' className='component'>
                        <div id='main' className='itemwrap'>
                            {/* <RouterView enter='fadeIn' enterTimeout={1000} leave='fadeOut' leaveTimeout={1000} />*/}
                            {/*simulatenous animation*/}
                            <RouterView className={this.state.selectedValue} enter='navInPrev' leave='navOutPrev' enterTimeout={500} leaveTimeout={500} simultaneous={true} />
                        </div>
                    </div>
                    <div>
                        {/* named view*/}
                        <RouterView name='customers' />
                    </div>
                </section>
            </div >
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
