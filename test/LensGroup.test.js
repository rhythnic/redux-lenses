import R from 'ramda';
import { lensGroup, lensSpecs } from './test-lenses';
import EnhancedLens from '../src/EnhancedLens';


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
