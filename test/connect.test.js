import connectLenses from '../src/connect';
import { lensGroup } from './test-lenses';
import ConnectedLens from '../src/ConnectedLens';


let connectFns, state;

beforeEach(() => {
  connectFns = connectLenses([lensGroup.pick(['navDrawerOpen'])]);
  state = { layout: { navDrawerOpen: false } };
})


test('connect result shape', () => {
  expect(connectFns.length).toBe(3);
  expect(connectFns[1]).toBeNull();
})


test('mapStateToProps', () => {
  const mapState = connectFns[0]();
  let stateProps = mapState(state);
  const cLens1 = stateProps.navDrawerOpen;
  expect(cLens1).toBeInstanceOf(ConnectedLens);
  state = { layout: { navDrawerOpen: false, other: 1 } };
  stateProps = mapState(state);
  expect(stateProps.navDrawerOpen).toBe(cLens1);
  state = { layout: { navDrawerOpen: true } };
  stateProps = mapState(state);
  expect(stateProps.navDrawerOpen).not.toBe(cLens1);
})


test('mergeProps', () => {
  const mapState = connectFns[0]();
  let stateProps = mapState(state);
  let ownProps = { other: 1 };
  let dispatch = jest.fn();
  const mergeProps = connectFns[2];
  const result = mergeProps(stateProps, { dispatch }, ownProps);
  expect(result).toHaveProperty('other');
  result.navDrawerOpen.set(true);
  expect(dispatch).toHaveBeenCalled();
  expect(result.navDrawerOpen.view()).toBe(false);
})
