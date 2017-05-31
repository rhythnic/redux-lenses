import { viewLenses, setStore, lensReducer, singleLensSetter, multipleLensSetter } from '../src/main';
import R from 'ramda';
import { lensGroup } from './test-lenses';


let state = { layout: { navDrawerOpen: true, appBarTitle: '' } };


test('viewLenses returns merged calls to enhancedLens.view', () => {
  let expected = { navDrawerOpen: true, appBarTitle: '' };
  expect(viewLenses(lensGroup.pick(['navDrawerOpen', 'appBarTitle']), state)).toEqual(expected);
  expected = { navDrawerOpen: false, appBarTitle: 'My App' };
  expect(viewLenses(lensGroup.pick(['navDrawerOpen', 'appBarTitle']), {})).toEqual(expected);
});



test('setStore: single', () => {
  const value = false;
  const enhancedLens = lensGroup.get('navDrawerOpen');
  let expected =
    { reduxLensesSetType: 'single'
    , type: `SET__${enhancedLens.id}`
    , lens: enhancedLens.lens
    , value
    , path: enhancedLens.path
    };
  expect(setStore([enhancedLens, false])).toEqual(expected);
});



test('setStore: multi', () => {
  const value = false;
  const lensValuePairs =
    [ [ lensGroup.get('navDrawerOpen'), true ]
    , [ lensGroup.get('appBarTitle'), 'other' ]
    ];
  let expected =
    { reduxLensesSetType: 'multiple'
    , type: `SET__${lensValuePairs[0][0].id},${lensValuePairs[1][0].id}`
    , lensValuePairs
    };
  expect(setStore(...lensValuePairs)).toEqual(expected);
});



test('lensReducer', () => {
  const nextState = {};
  const appReducer = () => nextState;
  const reducer = lensReducer(appReducer);
  expect(reducer({}, {})).toBe(nextState);
  const enhancedLens = lensGroup.get('navDrawerOpen');
  let action = enhancedLens.set(false);
  expect(reducer({}, action)).toEqual({ layout: { navDrawerOpen: false } });
  action = lensGroup.set({ navDrawerOpen: true, appBarTitle: 'other' });
  expect(reducer({}, action)).toEqual({ layout: { navDrawerOpen: true, appBarTitle: 'other' } })
});


test('singleLensSetter', () => {
  const enhancedLens = lensGroup.get('navDrawerOpen');
  let action = enhancedLens.set(false);
  let result = singleLensSetter({}, action);
  let expected = { layout: { navDrawerOpen: false } };
  expect(result).toEqual(expected);
  action = enhancedLens.set(x => !x);
  expected = { layout: { navDrawerOpen: true } };
  expect(singleLensSetter(result, action)).toEqual(expected);
});


test('multipleLensSetter sets lenses in order', () => {
  let action = lensGroup.set({ navDrawerOpen: true, appBarTitle: 'other', altTitleLens: 'final title' });
  let result = multipleLensSetter({}, action);
  let expected = { layout: { navDrawerOpen: true, appBarTitle: 'final title' } };
  expect(result).toEqual(expected);
});
