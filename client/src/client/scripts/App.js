import React                   from 'react';
import { Router, Route }       from 'react-router';
import Search                  from './components/Search';

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <header>
          <i className="fas fa-search-plus sf-logo"></i>
          <h1>HADES - semanttinen hakudemonstraattori</h1>
        </header>
        <div className="container">
          <Search/>
        </div>
      </div>
    );
  }
}
