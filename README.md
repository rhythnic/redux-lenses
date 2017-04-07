# redux-lenses
Abstractions that use Ramda lenses to interact with Redux store.

## Motivation
[Redux](http://redux.js.org/) is an excellent tool for state management, but
using the standard pattern of action creator to reducer to connect is tedious to do for each state variable.  Often people fall back to using React state. Redux Lenses is an attempt to make redux state management easier than React state management by using [Ramda](http://ramdajs.com/) lenses to mutate the redux state.

## Install

```
npm install --save redux-lenses
yarn add redux-lenses
```

## React dependency
Although react is not in the title, this library currently has a peer dependency on React.
Sometime in the future, I'll separate out the connect functionality to a separate library.
For the time being, this library only supports using Redux with React.


## Process

-  [Add Lens Reducer](#add-lens-reducer)
-  [Create a Lens Group](#create-a-lens-group)
-  [Connect to Component](#connect-to-component)
-  [Action Shape](#action-shape)
-  [In Action Creators](#in-action-creators)
-  [Async Requests](#async-requests)
-  [Using with React Redux](#react-redux)
-  [API](#api)



### <a name="add-lens-reducer"></a>Add lens reducer

redux-thunk is required for using the [request method](#async-requests)

```
import { createStore, applyMiddleware } from 'redux';
import { lensReducer } from 'redux-lenses';
import thunkMiddleware from 'redux-thunk';

const store = createStore(
  lensReducer(),
  initialState,
  applyMiddleware(thunkMiddleware)
);
```

To use redux lenses with another reducer, pass that reducer to lensReducer.

```
...

const reducer = combineReducers({ auth, appLayout });

const store = createStore(
  lensReducer( reducer ),
  initialState,
  applyMiddleware(thunkMiddleware)
);
```

One area of state, such as auth, can be altered via the auth sub-reducer or Redux Lenses.

### <a name="create-lens-group"></a>Create a Lens Group

Declare the absolute path of the lens within redux state.
Default is used if value is undefined or null.

```
// auth/lenses.js

import { LensGroup } from 'redux-lenses';
import User from './models/User';

export default new LensGroup(
  { user:
    { path: ['auth', 'user']
    , default: null
    }
  , redirectLoginToReferer:
    { path: ['auth', 'redirectLoginToReferer']
    , default: false
    }
  , loginRequest:
    { path: ['auth', 'loginRequest']
    , default: {}
    }
  }
);
```

### <a name="connect-to-component"></a>Connect to Component

Use view() to get the current value.  Use set(value) to set the value.
Set accepts a non-function value or an update function.

```
// auth/containers/Login.js

...
import authLenses from '../lenses';

class Login extends React.Component {
  componentWillUnmount() {
    this.props.redirectLoginToReferrer.set(false);
  }
  render() {
    const { props } = this;
    const user = props.user.view();
    const { from } = props.location.state || { from: { pathname: '/' } };
    if (props.redirectLoginToReferrer.view()) {
      return <Redirect to={from} />;
    }

    ...
  }
}

export default authLenses.connect(
  ['user', 'redirectLoginToReferer']
)(Login)
```


### <a name="action-shape"></a>Action Shape

The redux action has this shape.  It contains info about the lens that can be used in debugging.

```
{
  path: [ String ],      // path specified when creating lens
  lens: Function         // result of calling Ramda lensPath(path)
  type: 'SET_WITH_LENS',
  value                  // value or update function
}
```


### <a name="in-action-creators"></a>In Action Creators

```
// auth/actions.js

...
import authLenses from './lenses';


export function setUser(user) {
  return (dispatch, getState) => {
    const state = getState();
    const lastUser = authLenses.get('user').view(state);
    dispatch(authLenses.set('user', user));
    ...
    return user;
  }
}
```


## <a name="async-requests"></a>Async Requests
Redux Lenses offers a method called 'request' for managing the state around async requests,
such as API calls to the server.  The request method accepts a promise as it's only argument.
Make sure you've set the default value to an empty object in your lenses file.

```
// auth/actions.js

...
import authLenses from './lenses';


export function login(credentials) {
  return dispatch => {
    const promise =
      fetch('/api/users/login', { method: 'POST', data: credentials })
        .then(response => response.json())
        .then(user => dispatch(setUser(user));

    return dispatch(
      authLenses.get('loginRequest').request(promise)
    );
  }
}
```

There's no need to catch the errors.  Errors and results are captured in state.

```
// state.auth.loginRequest

// right after the request method is called, the state is set to:
{ inProgress: true, completed: false }

// if the promise is resolved, the state is set to:
{ inProgress: false, completed: true, result }

// if the promise is rejected, the error is caught, and state is set to:
{ inProgress: false, completed: true, error }
```


## <a name="react-redux"></a>Using with React Redux

```
function mapStateToProps(state) {
  return {
    ...authLenses.viewSet(['user'], state),
    ...appLayoutLenses.viewAll(state)
  };
}

export default connect(mapStateToProps);
```

Or simply
```
export default connect(authLenses.viewSet(['user']))
```


## <a name="api"></a>API

## LensGroup config object

```
{ uniqueLensIdentifier:
  { path: ["absolute", "path"]
  , initial: "Value used if undefined in state"
  , default: "Value used if null in state, or undefined if initial not included"
  , transform: functionForTransformingValue
  }
}
```

## LensGroup
Class for interacting with a group of lenses.


#### get :: String -> EnhancedLens

```
authLenses.get('user')
```

#### pick :: [ key:String ] -> { key: EnhancedLens }

```
authLenses.pick(['user', 'loginRequest'])
```

#### set :: String -> Any -> Redux Action

```
dispatch( authLenses.set('user', user) );
dispatch( authLenses.set('clickCount', x => x + 1) );
```

#### viewSet :: [ key:String ] -> state:Object -> { key: value }

```
authLenses.viewSet(['user'], state)
// { user: { name: 'Bob' } }
```

#### viewAll :: _ -> state:Object -> { key: value }

Same as viewSet, but it gives you values for all the lenses in the group.

### connect :: [ key:String ] -> { key: ConnectedLens }

Connect is a Higher Order Component

```
authLenses.connect(['user'])(MyComponent)
```


## EnhancedLens
Class for interacting with one lens.

### view :: Object -> Any

```
const userEnhancedLens = authLenses.get('user');
const user = userEnhancedLens.view(state);
```

### set :: Any -> Redux Action

```
const userEnhancedLens = authLenses.get('user');
dispatch(userEnhancedLens.set(user));
```

### request :: Promise -> Promise

```
...
dispatch(
  authLenses.get('loginRequest').request(loginPromise)
);
```

### resetRequest :: _ -> Redux Action

Removes result and error and sets state at that lens to:
```
{ inProgress: false, completed: false }
```


## ConnectedLens
Very similar API as EnhancedLens, except for connected lenses.

### view :: _ -> Any
```
const user = props.user.view()
```

### set :: Any -> _ (Sets State)

```
onClick: () => props.modalIsOpen.set(true)
onClick: () => props.modalIsOpen.set(x => !x)
```

### papp :: Any -> _ -> _ (Sets State)

Partially apply argument for set.

```
onClick: props.modalIsOpen.papp(true)
onClick: props.modalIsOpen.papp(x => !x)
```

### request :: Promise -> Promise (Sets State)

It may be cleaner to do requests in action creators, as demonstrated above.
It is also available on the connect lens, if you want to use it in containers.

```
props.loginRequest.request( login(credentials) );
```

Note:  The request method does not dispatch it's argument.

### resetRequest :: _ -> _ (Sets State)

Removes result and error and sets state at that lens to:
```
{ inProgress: false, completed: false }
```

```
onClick: () => props.loginRequest.resetRequest()
```
