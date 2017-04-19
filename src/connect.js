// ******************************************************************************
// Connect
// Component and Hoc for putting ConnectedLenses on props
// ******************************************************************************
import React, { createElement as h } from 'react';
import PT from 'prop-types';
import omit from 'ramda/src/omit';
import pick from 'ramda/src/pick';
import view from 'ramda/src/view';
import merge from 'ramda/src/merge';
import { viewLenses } from './main';
import ConnectedLens from './ConnectedLens';

// ******************************************************************************
// Helpers
// ******************************************************************************
const omitOwnProps = omit(['enhancedLenses', 'component']);

// ******************************************************************************
// Interface
// ******************************************************************************
const propTypes =
  { enhancedLenses: PT.object.isRequired
  , component: PT.oneOfType([PT.object, PT.func]).isRequired
  };

const contextTypes =
  { store: PT.object
  };

// ******************************************************************************
// Component
// ******************************************************************************
export class LensConnector extends React.Component {
  constructor(props, ...rest) {
    super(props, ...rest);
    this.storeListener = this.storeListener.bind(this);
    this.lensKeys = Object.keys(props.enhancedLenses);
    const values = this.getLensValues();
    this.state = this.nextState(values, values);
  }
  getLensValues() {
    const state = this.context.store.getState();
    return Object.keys(this.props.enhancedLenses).reduce((acc, key) => {
      acc[key] = view(this.props.enhancedLenses[key].lens, state);
      return acc;
    }, {});
  }
  nextState(allValues, changedValues) {
    const connectedLenses = this.state ? this.state.connectedLenses : {};
    return {
        values: allValues
      , connectedLenses: merge(connectedLenses, this.connectLenses(changedValues))
      }
  }
  componentDidMount() {
    this.unsubscribe = this.context.store.subscribe(this.storeListener);
    this.storeListener();
  }
  componentWillUnmount() {
    if (typeof this.unsubscribe === 'function') this.unsubscribe();
  }
  storeListener() {
    const nextValues = this.getLensValues();
    const changed = this.lensKeys.filter(key => nextValues[key] !== this.state.values[key]);
    if (!changed.length) return;
    this.setState(this.nextState(nextValues, pick(changed, nextValues)));
  }
  connectLenses(lensValues) {
    const { props, context: { store } } = this;
    return Object.keys(lensValues).reduce((acc, key) => {
      acc[key] = new ConnectedLens(props.enhancedLenses[key], lensValues[key], store);
      return acc;
    }, {});
  }
  render() {
    return h(
      this.props.component,
      Object.assign(omitOwnProps(this.props), this.state.connectedLenses) );
  }
}

LensConnector.propTypes = propTypes;
LensConnector.contextTypes = contextTypes;


// ******************************************************************************
// HOC
// ******************************************************************************
export default function LensConnectorHoc(enhancedLenses) {
  return component => props => h(LensConnector, Object.assign({}, props, { component, enhancedLenses}));
}
