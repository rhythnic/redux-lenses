import { bindLenses, isConnectedLens } from '../src/connect';
import { lensGroup } from './test-lenses';
import ConnectedLens from '../src/ConnectedLens';


let cLens;

beforeEach(() => {
  cLens = new ConnectedLens(lensGroup.get('navDrawerOpen'), false);
})


test('isConnectedLens', () => {
  expect(isConnectedLens(cLens)).toBe(true);
});


test('bindLenses', () => {
  const stateProps =
    { navDrawerOpen: cLens
    , other1: 1
    };
  const dispatchProps = {};
  const ownProps = { other2: 2 };
  expect(() => bindLenses(stateProps, dispatchProps, ownProps)).toThrow();
  const dispatch = jest.fn();
  dispatchProps.dispatch = dispatch;
  let result = bindLenses(stateProps, dispatchProps, ownProps);
  expect(result.other1).toBe(1);
  expect(result.other2).toBe(2);
  result.navDrawerOpen.set(true);
  expect(dispatch.mock.calls.length).toBe(1);
})
