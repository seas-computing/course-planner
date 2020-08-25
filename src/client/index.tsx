import React from 'react';
import { hot } from 'react-hot-loader/root';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ColdApp from './components/App';

const App = hot(ColdApp);

render(
  <BrowserRouter basename="/courses">
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
