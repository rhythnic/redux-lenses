import R from 'ramda';
import { setStore } from './main';


export default class EnhancedLens {
  constructor(lensSpec) {
    this.spec = lensSpec;
    this.lens = R.lensPath(lensSpec.path);
  }

  getAlteredValue(val) {
    const hasInitial = this.spec.hasOwnProperty('initial');
    const defaultVal = this.spec[ typeof val === 'undefined' && hasInitial ? 'initial' : 'default' ];
    const nextVal = typeof defaultVal !== 'undefined' ? R.defaultTo(defaultVal, val) : val;
    return typeof this.spec.transform === 'function' ? this.spec.transform(nextVal) : nextVal;
  }

  view(state) {
    return this.getAlteredValue( R.view(this.lens, state) );
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
