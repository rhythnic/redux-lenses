import R from 'ramda';
import { lensSpecs } from './test-lenses';
import EnhancedLens from '../src/EnhancedLens';


let state = { layout: { drawerOpen: true, title: '' } };
const drawerEnhancedLens = new EnhancedLens(lensSpecs.navDrawerOpen);
const titleEnhancedLens = new EnhancedLens(lensSpecs.appBarTitle);


test('EnhancedLens structure', () => {
  expect(R.view(drawerEnhancedLens.lens, state)).toBe(true);
  expect(drawerEnhancedLens.spec).toBe(lensSpecs.navDrawerOpen);
});


test('EnhancedLens view', () => {
  expect(drawerEnhancedLens.view(state)).toBe(true);
  expect(drawerEnhancedLens.view({})).toBe(false);
  expect(titleEnhancedLens.view({})).toBe('My App');
  expect(titleEnhancedLens.view({ layout: { title: null } })).toBeNull();
});
