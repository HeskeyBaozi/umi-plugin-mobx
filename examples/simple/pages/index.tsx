// tslint:disable
import * as React from 'react';
import Redirect from 'umi/redirect';

export default class IndexPage extends React.Component<{}> {
  render() {
    return (
      <Redirect to={'/about'} />
    );
  }
}
