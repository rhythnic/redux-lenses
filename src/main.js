// @flow

import curry from 'ramda/src/curry';
import identity from 'ramda/src/identity';
import over from 'ramda/src/over';
import set from 'ramda/src/set';


export const viewLenses = curry((enhancedLenses, state) => {
  return Object.keys(enhancedLenses).reduce((acc, id) => {
    const val = enhancedLenses[id].view(state);
    if (typeof val !== 'undefined') acc[id] = val;
    return acc;
  }, {});
});


export const setStore = curry((enhancedLense, value) => {
  return {
      path: enhancedLense.spec.path
    , lens: enhancedLense.lens
    , type: 'SET_WITH_LENS'
    , value
    }
});


export function lensReducer(reducer = identity) {
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
    ? over(lens, value, state)
    : set(lens, value, state);
}
