import LensGroup from '../src/LensGroup';

export const lensSpecs =
  { navDrawerOpen:
    { path: ['layout', 'drawerOpen']
    , default: false
    }
  , appBarTitle:
    { path: ['layout', 'title']
    , initial: 'My App'
    }
  };

export const lensGroup = new LensGroup(lensSpecs);
