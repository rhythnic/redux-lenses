import { viewLenses, setStore, lensReducer, lensSetter } from '../src/main';
import R from 'ramda';
import { lensGroup, lensSpecs } from './test-lenses';


let state = { layout: { drawerOpen: true, title: '' } };


test('viewLenses', () => {
  let expected = { navDrawerOpen: true, appBarTitle: '' };
  expect(viewLenses(lensGroup.enhancedLenses, state)).toEqual(expected);
  expected = { navDrawerOpen: false, appBarTitle: 'My App' };
  expect(viewLenses(lensGroup.enhancedLenses, {})).toEqual(expected);
});



test('setStore', () => {
  const value = false;
  const enhancedLense = lensGroup.get('navDrawerOpen');
  let expected =
    { type: 'SET_WITH_LENS'
    , value
    , path: enhancedLense.spec.path
    , lens: enhancedLense.lens
    };
  expect(setStore(enhancedLense, false)).toEqual(expected);
});



test('lensReducer', () => {
  const nextState = {};
  const appReducer = () => nextState;
  const reducer = lensReducer(appReducer);
  expect(reducer({}, {})).toBe(nextState);
  const enhancedLense = lensGroup.get('navDrawerOpen');
  const action = setStore(enhancedLense, false);
  expect(reducer({}, action)).toEqual({ layout: { drawerOpen: false } });
});



test('lensSetter', () => {
  const enhancedLense = lensGroup.get('navDrawerOpen');
  let action = setStore(enhancedLense, false);
  let result = lensSetter({}, action);
  let expected = { layout: { drawerOpen: false } };
  expect(result).toEqual(expected);
  action = setStore(enhancedLense, x => !x);
  expected = { layout: { drawerOpen: true } };
  expect(lensSetter(result, action)).toEqual(expected);
});
