// ******************************************************************************
// ConnectedLens
// Constructor that exposes methods for the viewing and setting the lens from the UI
// ******************************************************************************

export default class ConnectedLens {
  constructor(enhancedLens, value) {
    this._enhancedLens = enhancedLens;
    this.value = value;
    this.resetRequest = this.resetRequest.bind(this);
  }

  setDispatch(dispatch) {
    if (!this._dispatch) this._dispatch = dispatch;
  }

  view() {
    return this._enhancedLens.mapFn(this.value);
  }

  set(...args) {
    return this._dispatch(this._enhancedLens.set(...args));
  }

  papp(...args) {
    return () => this.set(...args);
  }

  request(...args) {
    return this._dispatch(this._enhancedLens.request(...args));
  }

  resetRequest() {
    return this._dispatch(this._enhancedLens.resetRequest());
  }
}
