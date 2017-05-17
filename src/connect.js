import ConnectedLens from './ConnectedLens';
import view from 'ramda/src/view';
import { bindActionCreators } from 'redux';


export function isConnectedLens(x) {
  return x instanceof ConnectedLens;
};


export function checkForDispatch(name, { dispatch }) {
  if (!dispatch) {
    throw new Error(`Redux Lenses ${name} method unable to find dispatch.  Ensure that the 2nd argument is an object that contains dispatch.`)
  }
}


export function bindLenses(stateProps, dispatchProps, ownProps) {
  checkForDispatch('bindLenses', dispatchProps);
  Object.keys(stateProps)
    .filter(x => isConnectedLens(stateProps[x]))
    .forEach(x => stateProps[x].setDispatch(dispatchProps.dispatch));
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}


export function bindLensesAndActionCreators(actions = {}) {
  return (stateProps, dispatchProps, ownProps) => {
    checkForDispatch('bindLensesAndActionCreators', dispatchProps);
    dispatchProps = Object.assign({}, dispatchProps, bindActionCreators(actions, dispatchProps.dispatch));
    return bindLenses(stateProps, dispatchProps, ownProps);
  }
}


//*************************************************************************
// Deprecated
//*************************************************************************
export default function connectLenses(groupList, mapDispatch) {

  if (!process || !process.env || process.env.NODE_ENV !== 'production') {
    console.warn("Redux Lenses: connectLenses is deprecated.  View current v1 docs for how to connect lenses.")
  }

  const lensGroup = Object.assign({}, ...groupList);
  const lensIds = Object.keys(lensGroup);


  const mapState = () => {

    // closure for cache
    return function() {
      const valueCache = {};
      const connectedLensCache = {};

      // return a fn from top-level mapState fn
      // this inner fn is used as mapStateToProps
      return state => lensIds.reduce((acc, id) => {
        const val = view(lensGroup[id].lens, state);
        if (!(id in valueCache) || val !== valueCache[id]) {
          valueCache[id] = val;
          connectedLensCache[id] = new ConnectedLens(lensGroup[id], val);
        }
        acc[id] = connectedLensCache[id];
        return acc;
      }, {});

    }();

  }

  // mergeProps
  // give dispatch to connected lenses
  const mergeProps = (stateProps, { dispatch }, ownProps) => {
    lensIds.forEach(id => stateProps[id].setDispatch(dispatch));
    const dispatchProps = !mapDispatch ? {} : Object.keys(mapDispatch).reduce((acc, key) => {
      acc[key] = (...args) => dispatch(mapDispatch[key](...args));
      return acc;
    }, {});
    return Object.assign({}, ownProps, stateProps, dispatchProps);
  }

  return [ mapState, null, mergeProps ];
}
