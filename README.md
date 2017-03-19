# React Spa Router

[![Build Status](https://travis-ci.org/romagny13/react-spa-router.svg?branch=master)](https://travis-ci.org/romagny13/react-spa-router)

Router for React applications:
- <strong>2 modes</strong> : <strong>hash</strong> and <strong>history</strong>
- <strong>page animation/transition with css or js</strong>
- <strong>activeClassName</strong>
- <strong>route guards</strong>
- <strong>children</strong>
- <strong>named views</strong>
- <strong>actions</strong>

## Installation

```
npm i react-spa-router -S
```

## Imports

```js
import { Router } from 'react-spa-router';
```

## Router & route configs

Router config | Description
-------- |  --------
routes | routes array
mode | <strong>hash</strong> (by default) and <strong>history</strong> (html5 history).
scroll | handle navigation to fragment (true by default)

Route config | Description
-------- |  --------
path |  the path pattern ("/posts" or "posts/:id" or "/posts/:id([a-z]+)" for example)
name | route name
action | an action
actions | an array of actions
data |  extra data to pass
canActivate | route guards
canDeactivate | route guards
redirectTo | redirect to route url
children | nested routes

<img src="http://res.cloudinary.com/romagny13/image/upload/v1483654173/captureurl_ejcmab.png" />

Example create routes
```js
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
                path: ':id',
                actions: [
                    () => viewRender(<CustomerList />, 'top'),
                    ({ router, route }) => viewRender(<CustomerDetail id={route.params.id} />, 'bottom'),
                    () => console.log('Activate customer detail')
                ]
            }]
    },
    { path: '**', redirectTo: '/' }
];
```

An action return the previous promise result. Example:
```js
const routes = [
    {
        path: '/', actions: [
            () => 'My result',
            ({ router, route, result }) => console.log(router, route, result)
        ]
    }
];
```

Create router (in App component)
```js
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
                        {/* named route */}
                        <Link tag='li' to={{ name: 'about' }} activeClassName='active'>About</Link>
                    </ul>
                </nav>
                <RouterView className={this.state.selectedValue} enter='navInPrev' leave='navOutPrev' enterTimeout={500} leaveTimeout={500} simultaneous={true} />
                 {/* named view*/}
                 <RouterView name='customers' />
            </div >
        );
    }
}
```

## Router Link

### With path
```js
<Link to='/'>Home</Link>
{/* with params */}
<Link to='/posts/10'>Detail</Link>
{/* with query and fragment */}
<Link to='/posts/10?q=abc&cat=10#section1'>Detail</Link>
```

Or
```js
 <Link to={{ path: '/posts/10', query: { q: 'mysearch' }, fragment: '#section1' }}>Detail</Link>
 ```

### Named route

```js
<Link to={{ name: 'about' }} activeClassName='active'>About</Link>
```

### activeClassName

```js
<Link to='/posts/10' activeClassName='active'>Detail</Link>
```

```css
.active {
    color: orange;
}
```

### exact (by default is true)
Set exact to false

```js
<Link to='/customers' activeClassName='active' exact={false}>Customers</Link>
```

### Pattern
Allow to define a regex to check active
```js
<Link to='/posts/10' activeClassName='active' activePattern={/\/posts\/[0-9]+/}>Detail/Link>
```

### Wrap link into an other element (tag)

Example link will be append to a li element. The activeClassName is added to li element.
```js
<ul>
    <Link tag='li' to='/' activeClassName='active'>Home</Link>
</ul>
```

## RouterView
Is the container for the "router-pages"

### Default RouterView
```js
 <RouterView />
 ```

### Named RouterView
```js
 <RouterView name='my-view' />
 ```

## Change view component with "viewRender" function

```js
viewRender(<Home />)
{/* or */}
viewRender(<Home />, 'default')
```

Change the content of a named view
```js
viewRender(<Home />, 'my-view')
```
## Navigate programmatically

```js
router.navigateToUrl('/posts/10?q=abc&cat=10#section1');
// or with named route (route name, params, query, fragment)
router.navigateTo('post-list', { id :10 }, { q: 'abc', cat: 10 }, '#section1');
```

+ replace, replaceUrl, goBack, goForward

### Animate RouterView

Example a fadeIn, fadeOut

```js
<RouterView enter='fadeIn' enterTimeout={1000} leave='fadeOut' leaveTimeout={1000} />
```

```css
@keyframes fadeIn {
    from { opacity: 0; }
    to {  opacity: 1;  }
}

@keyframes fadeOut {
    from {  opacity: 1; }
    to {  opacity: 0; }
}

.fadeIn {
    animation: 1s linear 0s fadeIn forwards;
}

.fadeOut {
    animation: 1s linear 0s fadeOut forwards;
}

.router-page {
    opacity: 0;
}

.router-page.current {
    opacity: 1;
}
```

### Simultaneous animation

```js
<RouterView className='fxShuffle' enter='navInPrev' leave='navOutPrev' enterTimeout={500} leaveTimeout={500} simultaneous={true} />
```

<img src="http://res.cloudinary.com/romagny13/image/upload/v1485903103/anim_perzdm.png" />

### JavaScript animation

Control animation with beforeEach, afterEach and error callback (page not found, navigation aborted with a guard)

```js
const router = new Router({routes}).beforeEach((next) => {
    // play animation
    next();
}).afterEach(() => {
    // play end animation
}).run(()=>{

}, ()=>{
    // on error
});
```

## Route Guards

Create a class
```js
class MyGuard {
    canActivate(route, next) {
        let result = confirm('Activate?');
        next(result);
    }
    canDeactivate(activeComponents, route, next) {
        let component = activeComponents['PostList'];
        let result = component && component.checkCanDeactivate ? component.checkCanDeactivate() : true;
        next(result);
    }
}
```

Add the guard to check can activate and can deactivate a route

```js
const routes = [
    { path: '/', action: () => viewRender(<Home />) },
    { path: '/posts', action: () => viewRender(<PostList />), canActivate: [MyGuard], canDeactivate: [MyGuard] }
];
```

Register a component with "setActiveComponent" function in order to access with the Guard
```js
export class PostList extends React.Component<any, any> {
    constructor(props) {
        super(props);
        setActiveComponent('PostList', this);
    }
    checkCanDeactivate() {
        return confirm('Deactivate?');
    }
    render() {
        return (
            <h1>Post list</h1>
        );
    }
}
```