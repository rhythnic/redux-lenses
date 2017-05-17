import ConnectedLens from './ConnectedLens';
import view from 'ramda/src/view';


export function isConnectedLens(x) {
  return x instanceof ConnectedLens;
};


export function bindLenses(stateProps, dispatchProps, ownProps) {
  if (!dispatchProps.hasOwnProperty('dispatch')) {
    throw new Error('Redux Lenses bindLenses method unable to find dispatch.  Ensure that the 2nd argument is an object that contains dispatch.')
  }
  Object.keys(stateProps)
    .filter(x => isConnectedLens(stateProps[x]))
    .forEach(x => stateProps[x].setDispatch(dispatchProps.dispatch));
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}


//*************************************************************************
// Deprecated
//*************************************************************************
export default function connectLenses(groupList, mapDispatch) {

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
