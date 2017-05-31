import R from 'ramda';
import { lensSpecs } from './test-lenses';
import EnhancedLens from '../src/EnhancedLens';
import { setStore } from '../src/main';


let state = { layout: { navDrawerOpen: true } };
const lensSpec =
  { id: 'navDrawerOpen'
  , path: ['layout', 'navDrawerOpen']
  , map: R.defaultTo(false)
  };
const drawerEnhancedLens = new EnhancedLens(lensSpec);


test('EnhancedLens structure', () => {
  expect(drawerEnhancedLens.id).toBe(lensSpec.id);
  expect(drawerEnhancedLens.path).toBe(lensSpec.path);
});


test('EnhancedLens view', () => {
  expect(drawerEnhancedLens.view(state)).toBe(true);
  expect(drawerEnhancedLens.view({})).toBe(false);
});


test('EnhancedLens setStore', () => {
  expect(drawerEnhancedLens.set(true)).toEqual(setStore([drawerEnhancedLens, true ]));
});


test('EnhancedLens request success', done => {
  const reqLens = new EnhancedLens({ id: 'req', path: ['req'] });
  const dispatch = jest.fn();
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 50);
  });
  const thunk = reqLens.request(promise);
  thunk(dispatch).then(() => {
    expect(dispatch.mock.calls[0][0]).toEqual(reqLens.set({ inProgress: true, completed: false }));
    expect(dispatch.mock.calls[1][0]).toEqual(reqLens.set({ inProgress: false, completed: true, result: 1 }));
    done();
  })
});


test('EnhancedLens request failure', done => {
  const reqLens = new EnhancedLens({ id: 'req', path: ['req'] });
  const dispatch = jest.fn();
  const error = new Error('test');
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => reject(error), 50);
  });
  const thunk = reqLens.request(promise);
  thunk(dispatch).then(() => {
    expect(dispatch.mock.calls[0][0]).toEqual(reqLens.set({ inProgress: true, completed: false }));
    expect(dispatch.mock.calls[1][0]).toEqual(reqLens.set({ inProgress: false, completed: true, error }));
    done();
  })
});
