import React from 'react';
import { map } from 'lodash';
import SearchResult from './SearchResult';
import { string, array } from 'prop-types';

export default function SearchResultList(props) {

  function renderResults(results) {
    return map(results, (result, idx) => {
      return <SearchResult
        key={idx + '-' + new Date().getTime()}
        url={result._source.url.short}
        title={result._source.headline.full}
        content={result._source.lead ? result._source.lead : ''}
      >
      </SearchResult>;
    });
  }

  return (
    <div className="search-results">
      {renderResults(props.results)}
    </div>
  );
}

SearchResultList.propTypes = {
  results: array,
};
