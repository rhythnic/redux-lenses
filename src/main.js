import R from 'ramda';


export const viewLenses = R.curry((enhancedLenses, state) => {
  return Object.keys(enhancedLenses).reduce((acc, id) => {
    const val = enhancedLenses[id].view(state);
    if (typeof val !== 'undefined') acc[id] = val;
    return acc;
  }, {});
});


export const setStore = R.curry((enhancedLense, value) => {
  return {
      path: enhancedLense.spec.path
    , lens: enhancedLense.lens
    , type: 'SET_WITH_LENS'
    , value
    }
});


export function lensReducer(reducer = R.identity) {
  return (state = {}, action = {}) => {
    switch(action.type) {
    case 'SET_WITH_LENS':
      return lensSetter(state, action);
    default:
      return reducer(state, action);
    }
  };
}


export function lensSetter(state, { lens, value }) {
  return typeof value === 'function'
    ? R.over(lens, value, state)
    : R.set(lens, value, state);
}
