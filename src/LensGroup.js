import pick from 'ramda/src/pick';
import { viewLenses, setStore } from './main';
import EnhancedLens from './EnhancedLens';
import ConnectedLens from './ConnectedLens';
import view from 'ramda/src/view';


export default class LensGroup {
  constructor({ basePath, lenses }) {
    this.basePath = basePath;
    this.enhancedLenses = this._createEnhancedLenses(basePath, lenses);
    this.connectedLenses = {};
    this._connectedLensValueCache = {};
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

  pick(lensIdList) {
    lensIdList.forEach(this.checkKey)
    return pick(lensIdList, this.enhancedLenses);
  }

  view(lensIdList, ...rest) {
    return viewLenses(this.pick(lensIdList), ...rest);
  }

  viewAll(...args) {
    return viewLenses(this.enhancedLenses, ...args);
  }

  set(idValObj) {
    const ids = Object.keys(idValObj);
    ids.forEach(this.checkKey);
    return setStore(...ids.map(id => [ this.get(id), idValObj[id] ]));
  }

  connect(lensIdList) {
    return state => {
      return lensIdList.reduce((acc, id) => {
        const val = view(this.get(id).lens, state);
        if (val !== this._connectedLensValueCache[id] || !(id in this.connectedLenses)) {
          this._connectedLensValueCache[id] = val;
          this.connectedLenses[id] = new ConnectedLens(this.enhancedLenses[id], val);
        }
        acc[id] = this.connectedLenses[id];
        return acc;
      }, {});
    }
  }
}
