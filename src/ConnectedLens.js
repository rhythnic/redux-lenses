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
    return this._enhancedLens.transform(this.value);
  }

  dispatch(...args) {
    if (!this._dispatch) {
      console.error(`Redux Lenses: attempted to dispatch action from ConnectedLens ${this._enhancedLens.id} without first having provided it with dispatch function.`);
      return;
    }
    return this._dispatch(...args);
  }

  set(val) {
    return this.dispatch(this._enhancedLens.set(val));
  }

  papp(val) {
    return () => this.set(val);
  }

  request(...args) {
    return this.dispatch(this._enhancedLens.request(...args));
  }

  resetRequest() {
    return this.dispatch(this._enhancedLens.resetRequest());
  }
}
