///<reference types="webpack-env" />
// HTML
// import './index.html';
// To use custom globals
// import GLOBALS from '../global.config.json';

// Must be the first import, require so it will be optimized out
if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
}

import { JSX, render } from 'preact';
import { RoutableProps, route, Router } from 'preact-router';
import { useLayoutEffect } from 'preact/hooks';
import { getStoreContext } from 'predux/preact';
import { RootState, store } from './features/store';
import './scss/index.scss';
import { Settings } from './settings/Settings';
import { Welcome } from './welcome/welcome';

const Redirect = (props: { to: string }): JSX.Element => {
  useLayoutEffect(() => {
    route(props.to, true);
  });

  return <></>;
};

declare module 'preact' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicAttributes extends RoutableProps {}
  }
}

const App = () => {
  const StoreContext = getStoreContext<RootState>();
  return (
    <StoreContext.Provider value={store}>
      <Router>
        <Welcome path="/:page?" />
        <Settings path="/settings/:page?" />
        <Redirect default to="/" />
      </Router>
    </StoreContext.Provider>
  );
};

// Render the application
render(<App />, document.body);

// HMR
if (module.hot) {
  module.hot.accept();
  module.hot.dispose(function () {
    // Clean document for refresh
    render(null, document.body);
  });
}
