import pick from 'ramda/src/pick';
import { viewLenses, setStore } from './main';
import EnhancedLens from './EnhancedLens';


export default class LensGroup {
  constructor({ basePath, lenses }) {
    this.basePath = basePath;
    this.enhancedLenses = this._createEnhancedLenses(basePath, lenses);
    this.checkKey = this.checkKey.bind(this);
  }

  _createEnhancedLenses(basePath, lenses) {
    return Object.keys(lenses).reduce((acc, id) => {
      let spec = typeof lenses[id] === 'function' ? { map: lenses[id] } : Object.assign({}, lenses[id]);
      spec.id = id;
      spec.path = [ ...basePath, ...(Array.isArray(spec.path) ? spec.path : [id]) ];
      acc[id] = new EnhancedLens(spec);
      return acc;
    }, {});
  }

  checkKey(id) {
    if (!this.enhancedLenses[id]) {
      throw new Error(`Invalid lens id '${id}' passed to LensGroup with basePath ${this.basePath.join(',')}`);
    }
  }

  get(id) {
    this.checkKey(id);
    return this.enhancedLenses[id];
  }

  pick(lensKeyList) {
    lensKeyList.forEach(this.checkKey)
    return pick(lensKeyList, this.enhancedLenses);
  }

  view(lensKeyList, ...rest) {
    return viewLenses(this.pick(lensKeyList), ...rest);
  }

  viewAll(...args) {
    return viewLenses(this.enhancedLenses, ...args);
  }

  set(idValObj) {
    const ids = Object.keys(idValObj);
    ids.forEach(this.checkKey);
    return setStore(...ids.map(id => [ this.get(id), idValObj[id] ]));
  }
}
