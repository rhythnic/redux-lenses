import pick from 'ramda/src/pick';
import { viewLenses, setStore } from './main';
import EnhancedLens from './EnhancedLens';
import connect from './connect';


export default class LensGroup {
  constructor(lensSpecs) {
    this.enhancedLenses = this._createEnhancedLenses(lensSpecs);
    this.viewAll = this.viewAll.bind(this);
  }

  _createEnhancedLenses(lensSpecs) {
    return Object.keys(lensSpecs).reduce((acc, id) => {
      acc[id] = new EnhancedLens(lensSpecs[id]);
      return acc;
    }, {});
  }

  _checkKeyValidity(key) {
    if (!this.enhancedLenses[key]) {
      throw new Error('Invalid key passed to LensGroup:', key);
    }
  }

  get(key) {
    return this.enhancedLenses[key];
  }

  pick(lensKeyList) {
    return pick(lensKeyList, this.enhancedLenses);
  }

  viewSet(lensKeyList, ...rest) {
    const lensSet = this.pick(lensKeyList);
    return viewLenses(lensSet, ...rest);
  }

  viewAll(state) {
    return viewLenses(this.enhancedLenses, state);
  }

  set(key, ...rest) {
    this._checkKeyValidity(key);
    return setStore(this.enhancedLenses[key], ...rest);
  }

  connect(lensKeyList) {
    return connect(this.pick(lensKeyList));
  }
}
