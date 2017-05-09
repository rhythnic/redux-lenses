import LensGroup from '../src/LensGroup';
import R from 'ramda';

export const lensSpecs =
  { basePath: ['layout']
  , lenses:
    { navDrawerOpen: R.defaultTo(false)
    , appBarTitle: R.defaultTo('My App')
    , altTitleLens: { path: ['appBarTitle'] }
    }
  };

export const lensGroup = new LensGroup(lensSpecs);
