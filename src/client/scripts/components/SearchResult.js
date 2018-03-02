import React from 'react';
import { string } from 'prop-types';

export default class SearchResult extends React.Component {

  constructor(props) {
    super(props);
    this.url = props.url;
    this.title = props.title;
    this.content = props.content
  }

  render() {
    return (
      <div className="search-result">
        <div className="title"><a href={this.url}>{this.title}</a></div>
        <div className="content">{this.content}</div>
        <hr/>
      </div>
    );
  }
}

SearchResult.propTypes = {
  url: string,
  content: string,
  title: string,
};
