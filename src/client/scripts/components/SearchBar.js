import React from 'react';
import { map, debounce } from 'lodash';
import Promise from 'bluebird';
import Autocomplete from 'react-autocomplete';
import webApi from '../lib/webApi';
import { func } from 'prop-types';

export default class SearchBar extends React.Component {

  constructor(props) {
    super(props);

    // Debounced so that a query isn't fired for each keystroke
    this.delayedQueryChanged = debounce(this._handleQueryChange.bind(this), 200);

    this.onQueryChange = this.onQueryChange.bind(this);

    this.state = {
      query: '',
      queryUri: '',
      autoComplete: [],
      loading: false,
      searchResults: [],
      acQueryTs: new Date().getTime()
    };
  }

  onQueryChange(event, value, uri) {
    const ts = new Date().getTime();
    this.setState({
      acQueryTs: ts,
      value,
      loading: true,
      query: value,
      queryUri: uri,
    });
    this.delayedQueryChanged(value, ts);
    this.props.onInputChange(value, uri);
  }

  _handleQueryChange(value, ts) {
    return this.queryAc(value)
      .then((items) => {
        if (ts == this.state.acQueryTs)
          this.setState({ autoComplete: items, loading: false });
      })
      .catch((err) => { console.log(err); });
  }

  // Autocomplete
  queryAc(query) {
    return new Promise((resolve, reject) => {
      if (!query) {
        return resolve([]);
      }
      webApi.searchForEntities(query)
         .then((items) => { return resolve(items); })
        .catch((err) => { return reject(err); });
    });
  }

  render() {
    return (
      <Autocomplete
        className="form-control"
        placeholder="Nimi"
        wrapperProps={{ className: 'query-wrapper' }}
        inputProps={{ id: 'query-autocomplete', placeholder: 'Hakusana(t)', className: 'form-control' }}
        value={this.state.value}
        items={this.state.autoComplete}
        getItemValue={(item) => item.label}
        onSelect={(value, item) => {
          this.setState({ value, autoComplete: [item], query : item.label, queryUri: item.uri });
          this.onQueryChange(null, item.label, item.uri);
        }}
        onChange={this.onQueryChange}
        renderItem={(item, isHighlighted) => (
          <div
            style={{ background: isHighlighted ? 'lightgray' : 'white' }}
            key={item.uri}
            id={item.uri}
          >{item.label}</div>
        )}
      />
    );
  }
}

SearchBar.propTypes = {
  onInputChange: func
};
