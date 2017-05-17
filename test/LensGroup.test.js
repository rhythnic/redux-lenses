import R from 'ramda';
import { lensGroup, lensSpecs } from './test-lenses';
import EnhancedLens from '../src/EnhancedLens';
import ConnectedLens from '../src/ConnectedLens';


let state = { layout: { navDrawerOpen: true, appBarTitle: '' } };


test('LensGroup get', () => {
  expect(lensGroup.get('navDrawerOpen')).toBeInstanceOf(EnhancedLens);
  expect(() => lensGroup.get('badId')).toThrow();
});


test('LensGroup pick', () => {
  expect(lensGroup.pick(['navDrawerOpen'])).toEqual({ navDrawerOpen: lensGroup.get('navDrawerOpen') });
});


test('LensGroup view', () => {
  let expected = { navDrawerOpen: true, appBarTitle: '' };
  expect(lensGroup.view(['navDrawerOpen', 'appBarTitle'], state)).toEqual(expected);
  expect(lensGroup.viewAll(state)).toEqual({ navDrawerOpen: true, appBarTitle: '', altTitleLens: '' });
});


test('LensGroup set', () => {
  expect(() => lensGroup.set('badKey')).toThrow();
  // set return value matches setStore method in main and is tested there
});


test('LensGroup connect', () => {
  const mapStateFn = lensGroup.connect(['navDrawerOpen']);
  const result1 = mapStateFn(state);
  expect(result1.navDrawerOpen).toBeInstanceOf(ConnectedLens);
  const result2 = mapStateFn(state);
  expect(result1.navDrawerOpen).toBe(result2.navDrawerOpen);
  const nextState = { layout: { navDrawerOpen: false } };
  const result3 = mapStateFn(nextState);
  expect(result3.navDrawerOpen).not.toBe(result1.navDrawerOpen);
});
