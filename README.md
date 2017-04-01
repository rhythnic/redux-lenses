# redux-lenses
Abstractions that use Ramda lenses to interact with Redux store.

## Motivation
[Redux](http://redux.js.org/) is an excellent tool for state management, but
using the standard pattern of action creator to reducer to connect is tedious to do for each state variable.  Often people fall back to using React state. Redux Lenses is an attempt to make redux state management easier than React state management by using [Ramda](http://ramdajs.com/) lenses to mutate the redux state.

## Process

### Add lens reducer

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

### Create a lens group

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

### Connect to Component

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


### Action Shape

The redux action has this shape.  It contains info about the lens that can be used in debugging.

```
{
  path: [ String ],      // path specified when creating lens
  lens: Function         // result of calling Ramda lensPath(path)
  type: 'SET_WITH_LENS',
  value                  // value or update function
}
```


### In Action Creators

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


## Async Requests
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


## API

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

#### viewSet :: [ key:String ] -> { key: value }

```
authLenses.viewSet(['user'])
// { user: { name: 'Bob' } }
```

#### viewAll :: _ -> { key: value }

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

## request :: Promise -> Promise

```
...
dispatch(
  authLenses.get('loginRequest').request(loginPromise)
);
```

## resetRequest :: _ -> Redux Action

Removes result and error and sets state at that lens to:
```
{ inProgress: false, completed: false }
```


## ConnectedLens
Very similar API as EnhancedLens, except for connected lenses.

## view :: _ -> Any
```
const user = props.user.view()
```

## set :: Any -> _ (Sets State)

```
onClick: () => props.modalIsOpen.set(true)
onClick: () => props.modalIsOpen.set(x => !x)
```

## papp :: Any -> _ -> _ (Sets State)

Partially apply arguments for set.

```
onClick: props.modalIsOpen.papp(true)
onClick: props.modalIsOpen.papp(x => !x)
```

## request :: Promise -> Promise (Sets State)

It may be cleaner to do requests in action creators, as demonstrated above.
It is also available on the connect lens, if you want to use it in containers.

```
props.loginRequest.request( login(credentials) );
```

Note:  The request method does not dispatch it's argument.

## resetRequest :: _ -> _ (Sets State)

Removes result and error and sets state at that lens to:
```
{ inProgress: false, completed: false }
```

```
onClick: () => props.loginRequest.resetRequest()
```
