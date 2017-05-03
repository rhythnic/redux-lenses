// @flow

import curry from 'ramda/src/curry';
import identity from 'ramda/src/identity';
import over from 'ramda/src/over';
import set from 'ramda/src/set';


export const viewLenses = curry((enhancedLenses: { }, state: {}) => {
  return Object.keys(enhancedLenses).reduce((acc, id) => {
    const val = enhancedLenses[id].view(state);
    if (typeof val !== 'undefined') acc[id] = val;
    return acc;
  }, {});
});


export const setStore = curry((
  enhancedLense: { spec: { path: Array<string|number> }, lens: () => mixed },
  value: any) => {
  return {
      path: enhancedLense.spec.path
    , lens: enhancedLense.lens
    , type: 'SET_WITH_LENS'
    , value
    }
});


export function lensReducer(
  reducer: (state: {}, action: { type: string, lens?: () => mixed, value?: any }) => {} = identity) {
  return (state: {} = {}, action: { type: string, lens?: () => mixed, value?: any }): {} => {
    switch(action.type) {
    case 'SET_WITH_LENS':
      return lensSetter(state, action);
    default:
      return reducer(state, action);
    }
  };
}


export function lensSetter(state: {}, action: { lens?: () => mixed, value?: any }) {
  if (!action.lens) return state;
  return typeof action.value === 'function'
    ? over(action.lens, action.value, state)
    : set(action.lens, action.value, state);
}
