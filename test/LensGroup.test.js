import R from 'ramda';
import { lensGroup, lensSpecs } from './test-lenses';


let state = { layout: { drawerOpen: true, title: '' } };


test('LensGroup structure', () => {
  expect(lensGroup.get('appBarTitle').spec).toBe(lensSpecs.appBarTitle);
});


test('LensGroup view', () => {
  let expected = { navDrawerOpen: true, appBarTitle: '' };
  expect(lensGroup.viewSet(['navDrawerOpen', 'appBarTitle'], state)).toEqual(expected);
  expect(lensGroup.viewAll(state)).toEqual(expected);
});


test('LensGroup set', () => {
  expect(() => lensGroup.set('badKey')).toThrow();
  // set return value matches setStore method in main and is tested there
});
