import lensPath from 'ramda/src/lensPath';
import defaultTo from 'ramda/src/defaultTo';
import view from 'ramda/src/view';
import { setStore } from './main';


export default class EnhancedLens {
  constructor(lensSpec) {
    this.spec = lensSpec;
    this.lens = lensPath(lensSpec.path);
  }

  getAlteredValue(val) {
    const hasInitial = this.spec.hasOwnProperty('initial');
    const defaultVal = this.spec[ typeof val === 'undefined' && hasInitial ? 'initial' : 'default' ];
    const nextVal = typeof defaultVal !== 'undefined' ? defaultTo(defaultVal, val) : val;
    return typeof this.spec.transform === 'function' ? this.spec.transform(nextVal) : nextVal;
  }

  view(state) {
    return this.getAlteredValue( view(this.lens, state) );
  }

  set(...args) {
    return setStore(this, ...args)
  }

  request(promise) {
    return dispatch => {
      dispatch(this.set({ inProgress: true, completed: false }));
      return promise.then(
        result => {
          dispatch(this.set({ inProgress: false, result, completed: true }));
          return result;
        },
        error => dispatch(this.set({ inProgress: false, error, completed: true }))
      )
    }
  }

  resetRequest() {
    return this.set({ inProgress: false, completed: false });
  }
}
