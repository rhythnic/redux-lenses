// ******************************************************************************
// ConnectedLens
// Constructor that exposes methods for the viewing and setting the lens from the UI
// ******************************************************************************

export default class ConnectedLens {
  constructor(enhancedLens, value, store) {
    this._enhancedLens = enhancedLens;
    this.value = value;
    this._store = store;
    this.resetRequest = this.resetRequest.bind(this);
  }

  view() {
    return this._enhancedLens.getAlteredValue(this.value);
  }

  set(...args) {
    return this._store.dispatch(this._enhancedLens.set(...args));
  }

  papp(...args) {
    return () => this.set(...args);
  }

  request(...args) {
    return this._store.dispatch(this._enhancedLens.request(...args));
  }

  resetRequest() {
    return this._store.dispatch(this._enhancedLens.resetRequest());
  }
}
