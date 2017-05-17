# redux-lenses v1
Abstractions that use Ramda lenses to interact with the Redux store.

## Motivation
[Redux](http://redux.js.org/) is an excellent tool for state management, but
using the standard pattern of action creator to reducer is tedious to do for each state variable.
Often people fall back to using React state. Redux Lenses is an attempt to make Redux state management
easier than React state management by using [Ramda](http://ramdajs.com/) lenses to mutate the Redux state.

## Install

```
npm install --save redux-lenses@next
yarn add redux-lenses@next
```

## React Example

This is the authentication example from the [React Router docs](https://reacttraining.com/react-router/web/example/auth-workflow),
with React state changed to Redux state via Redux Lenses.  One of the benefits of using Redux Lenses is that value
and the setter are one prop instead of 2 props.

```
...
import authLenses from '../lenses';
import { bindLenses } from 'redux-lenses';
import { connect } from 'react-redux';


class Login extends React.Component {

  componentWillMount() {
    this.props.redirectLoginToReferrer.set(false);
  }

  login = () => {
    fakeAuth.authenticate(() => {
      this.props.redirectLoginToReferrer.set(true);
    })
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }

    if (this.props.redirectLoginToReferrer.view()) {
      return (
        <Redirect to={from}/>
      )
    }

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    )
  }
}


export default connect(
  authLenses.connect(['redirectLoginToReferrer']),
  null,
  bindLenses
)(Login);
```


## Piece-By-Piece

-  [Add Lens Reducer](#add-lens-reducer)
-  [Create a Lens Group](#create-a-lens-group)
-  [Connect to Component](#connect-to-component)
-  [Action Shape](#action-shape)
-  [In Action Creators](#in-action-creators)
-  [Async Requests](#async-requests)
-  [Computed Props and Reselect](#reselect)
-  [Framework Compatibility](#framework-compatibility)
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

To use Redux Lenses with another reducer, pass that reducer to lensReducer.

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

```
// auth/lenses.js

import { LensGroup } from 'redux-lenses';
import R from 'ramda';

export default new LensGroup(
  { basePath: ['auth']
  , lenses:
    { loginRequest:
      { path: ['requests', 'login']
      , map: R.defaultTo({})
      }
    , user: {}
    , redirectLoginToReferrer: R.defaultTo(false)
    }
  }
);
```

The object passed to the LensGroup constructor accepts basePath and lenses.
Let's start with loginRequest.  The lens config object accepts path and map
properties.  The basePath of the lens group is prepended to this path,
so the path of loginRequest within state is ['auth', 'requests', 'login'].
The map function gives you a chance to map the value after retrieving the value from state.
This is how you declare default values, use constructors, or alter the value however you'd like.


Now let's look at user.  We don't want to specify a path or map function for user.
The path of user in state will be ['auth', 'user'];


Instead of passing an object for lens configuration, you can just pass the map function.
That's how redirectLoginToReferrer is configured.  Because the path isn't spedified, it will
be ['auth', 'redirectLoginToReferrer'];



### <a name="connect-to-component"></a>Connect to Component

Use view() to get the current value.
Use set(value) or set(value => nextValue) to set the value.

```
// I didn't show the creation of the layout lenses.
import layoutLenses from '../lenses';
import authLenses from '../../auth/lenses';
import { bindLenses } from 'redux-lenses';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { logout } from '../../auth/actions';


class AppLayout extends React.Component {
  componentWillMount() {
    this.props.drawerOpen.set(false);
  }
  render() {
    const { props } = this;
    const user = props.user.view();

    return (
      <div>
        <AppBar>
          {!!user &&
          <DrawerToggleButton onClick={() => props.drawerOpen.set(x => !x)} />}
          <LogoutButton onClick={props.logout}/>
        </AppBar>
        <Drawer
          onRequestClose={() => props.drawerOpen.set(false)}
          open={props.drawerOpen.view()}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...layoutLenses.connect(['drawerOpen'])(state),
    ...authLenses.connect(['user'])(state)
  };
}

export default connect(
  mapStateToProps
  dispatch => ({ dispatch, ...bindActionCreators({ logout }, dispatch) }),
  bindLenses
)(AppLayout);
```

bindLenses needs access to dispatch, so dispatch needs to be put on props by your mapDispatchToProps
function.  You can also pass null as mapDispatchToProps.


### <a name="action-shape"></a>Action Shape

The redux actions that get created when you call "set" have information about the lens
that you can use in debugging

```
{ type: 'SET__drawerOpen'
, path: [ 'auth', 'drawerOpen' ]
, value
, ...
}
```


### <a name="in-action-creators"></a>In Action Creators

```
// auth/actions.js

...
import authLenses from './lenses';


export function setUser(user) {
  return authLenses.set({ user, redirectLoginToReferrer: !!user }));
}


export function login(credentials) {
  return dispatch => {
    const promise = authService.login(credentials).then(user => {
      dispatch(setUser(user));
    });
    const loginRq = authLenses.get('loginRequest');
    return dispatch(loginRq.request(promise));
  }
}


export function logout() {
  return (dispatch, getState) => {
    const { user } = authLenses.view(['user'], getState());
    alert(`Goodbye ${user.name}`);

    return dispatch(authLenses.get('logoutRequest').request(
      authService.logout().then(() => dispatch(setUser()))
    ));
  }
}
```


## <a name="async-requests"></a>Async Requests
Redux-lenses offers a method called 'request' for managing the state around async requests,
The request method accepts a promise as it's only argument.
It helps to use an empty object as the default when you create the lens.
See the above code for an example.

Request tracks the state of an async request.
There's no need to catch the errors.  Errors and results are captured in state.

```
// right after the request method is called, the state is set to:
{ inProgress: true, completed: false }

// if the promise is resolved, the state is set to:
{ inProgress: false, completed: true, result }

// if the promise is rejected, the error is caught, and state is set to:
{ inProgress: false, completed: true, error }
```

Then in your components, it's trivial to show results and errors.
Here, ErrorText is a component that will only show a message if error has a value.

```
function LoginForm(props) {
  return (
    <form>
      <input name="email" />
      <input name="password" type="password" />
      <button onClick={props.login}>Login</button>
      <ErrorText error={props.loginRequest.view().error} />
    </div>
  );
}
```


### <a name="reselect"></a>Computed Props and Reselect
[Reselect](https://github.com/reactjs/reselect) is the recommended way for deriving computed props from your redux state.
The EnhancedLens.view method is what Reselect refers to as an input-selector.
Here is a reselect example rewritten with Redux Lenses.

```
import { createSelector } from 'reselect'
import todoLenses from '../lenses';

export const getVisibleTodos = createSelector(
  [ todoLenses.get('visibilityFilter').view, todoLenses.get('todos').view ],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_ALL':
        return todos
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed)
    }
  }
)
```



### <a name="framework-compatibility"></a>Framework compatibility
Redux Lenses, like Redux, isn't specific to React.  Redux Lenses should work anywhere Redux works.
The included bindLenses function is built to match the API of React-Redux's mergeProps function.
Redux Lenses might not be compatible with the bindings for other frameworks, so you may have to write
custom connect code to connect Redux Lenses with the components of frameworks other than React.



## <a name="api"></a>API

## LensGroup class

#### get :: String -> EnhancedLens

```
authLenses.get('user')
```

#### pick :: [ key:String ] -> { key: EnhancedLens }

```
authLenses.pick(['user', 'loginRequest'])
```

#### set :: { key: value|updateFunction } -> Redux Action

```
dispatch( authLenses.set({ user }));
dispatch( authLenses.set({ clickCount: x => x + 1 }));
```

#### view :: [ key:String ] -> state:Object -> { key: value }

```
authLenses.view(['user'], state)
// { user: { name: 'Bob' } }
```

#### viewAll :: state:Object -> { key: value }

Same as view but it gives you values for all the lenses in the group.

#### connect :: [ key:String ] -> state:Object -> { key: ConnectedLens }

Returns an object of Connected Lenses.  Before you can dispatch actions from
the Connected Lens, it needs access to the dispatch function via ConnectedLens.setDispatch(dispatch).
This is what happens inside of the bindLenses function in the examples.



## EnhancedLens class
Class for interacting with one lens that hasn't yet been connected.
Mostly this is inside of action creators.

### view :: Object -> Any

```
const userEnhancedLens = authLenses.get('user');
const user = userEnhancedLens.view(state);
```

### set :: value|updateFunction -> Redux Action

```
const userEnhancedLens = authLenses.get('user');
dispatch(userEnhancedLens.set(user));
```

### request :: Promise -> ReduxThunkFunction(Action)
The result of dispatching the thunk action is the result of the promise.
If there is an error, the error is caught, and the result is { error };

```
const promiseResult = dispatch(
  authLenses.get('loginRequest').request(loginPromise)
);
```

### resetRequest :: _ -> Redux Action
Resets request state to:

```
{ inProgress: false, completed: false }
```

### transform :: Any -> Any
This allows you to transform a value via the EnhancedLens's map function, which
you specify when creating the LensGroup.  This is used by the ConnectedLens and
not something you'll likely ever use.


## ConnectedLens class
Very similar API as EnhancedLens, except for connected lenses.
This is the API inside of your components.

### view :: _ -> Any
```
const user = props.user.view()
```

### set :: value|updateFunction -> (dispatches action to set state)

```
onClick: () => props.modalIsOpen.set(true)
onClick: () => props.modalIsOpen.set(x => !x)
```

### papp :: value|updateFunction -> _ -> (dispatches action to set state)
Papp stands for "partially apply".
It's an alternative to creating anonymous functions.

```
onClick: props.modalIsOpen.papp(true)
onClick: props.modalIsOpen.papp(x => !x)
```

### request :: Promise -> (dispatches actions to set state)
Will set state twice, once initially, and once when the promise resolves or rejects.
Request does not dispatch the promise.  In this example, we're assuming
login was already bound to dispatch.

```
props.loginRequest.request( login(credentials) );
```

### resetRequest :: _ -> (dispatches action to set state)
Resets request state to:

```
{ inProgress: false, completed: false }
```

```
onClick: () => props.loginRequest.resetRequest()
```
