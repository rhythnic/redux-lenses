import ConnectedLens from './ConnectedLens';
import view from 'ramda/src/view';

export default function connectLenses(groupListArg, ...rest) {

  const groupList = Array.isArray(groupListArg) ? groupListArg : [ groupListArg, ...rest ];
  const mapDispatch = Array.isArray(groupListArg) ? rest[0] : void 0;

  const lensGroup = Object.assign({}, ...groupList);
  const lensIds = Object.keys(lensGroup);


  const mapState = () => {

    // closure for cache
    return function() {
      const valueCache = {};
      const connectedLensCache = {};

      // return a fn from top-level mapState fn
      // this inner fn is used as mapStateToProps
      return state => {
        return lensIds.reduce((acc, id) => {
          const val = view(lensGroup[id].lens, state);
          if (!(id in valueCache) || val !== valueCache[id]) {
            valueCache[id] = val;
            connectedLensCache[id] = new ConnectedLens(lensGroup[id], val);
          }
          acc[id] = connectedLensCache[id];
          return acc;
        }, {});
      };

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
