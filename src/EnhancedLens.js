import lensPath from 'ramda/src/lensPath';
import view from 'ramda/src/view';
import identity from 'ramda/src/identity';
import { setStore } from './main';


export default class EnhancedLens {
  constructor({ id, path, map }) {
    this.id = id;
    this.path = path;
    this.lens = lensPath(path);
    this._mapFn = typeof map === 'function' ? map : identity;
    this.view = this.view.bind(this);
  }

  view(state) {
    return this._mapFn(view(this.lens, state));
  }

  transform(val) {
    return this._mapFn(val);
  }

  set(val) {
    return setStore([ this, val ])
  }

  request(promise) {
    return dispatch => {
      dispatch(this.set({ inProgress: true, completed: false }));
      return promise.then(
        result => {
          dispatch(this.set({ inProgress: false, result, completed: true }));
          return result;
        },
        error => {
          dispatch(this.set({ inProgress: false, error, completed: true }))
          return { error };
        }
      )
    }
  }

  resetRequest() {
    return this.set({ inProgress: false, completed: false });
  }
}
