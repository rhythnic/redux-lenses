import curry from 'ramda/src/curry';
import over from 'ramda/src/over';
import set from 'ramda/src/set';
import identity from 'ramda/src/identity';


export const viewLenses = curry((enhancedLenses = {}, state = {}) => {
  return Object.keys(enhancedLenses).reduce((acc, id) => {
    acc[id] = enhancedLenses[id].view(state);
    return acc;
  }, {});
});


export function setStore(...lensValuePairs) {
  return lensValuePairs.length === 1
    ? setSingleLens(lensValuePairs[0])
    : setMultipleLenses(lensValuePairs);
};


export function setSingleLens([ { path, lens, id }, value ]) {
  return {
    reduxLensesSetType: 'single'
  , type: `SET__${id}`
  , lens
  , value
  , path
  }
}

export function setMultipleLenses(lensValuePairs) {
  return {
    reduxLensesSetType: 'multiple'
  , type: `SET__${lensValuePairs.map(x => x[0].id).join(',')}`
  , lensValuePairs
  }
}


export function lensReducer(reducer = identity) {
  return (state, action) => {
    switch(action.reduxLensesSetType) {
      case 'single':
        return singleLensSetter(state, action);
      case 'multiple':
        return multipleLensSetter(state, action);
      default:
        return reducer(state, action);
    }
  }
}


export function singleLensSetter(state, { lens, value }) {
  if (!lens) return state;
  return typeof value === 'function'
    ? over(lens, value, state)
    : set(lens, value, state);
}


export function multipleLensSetter(state, { lensValuePairs }) {
  return lensValuePairs.reduce((acc, [ { lens }, value ]) => {
    return singleLensSetter(acc, { lens, value });
  }, state);
}
