import * as React from 'react';
import { Provider } from 'mobx-react';
import { getType } from 'mobx-state-tree';

/*<% MOBX_STORES %>*/

export default class MobxModelProvider extends React.Component {
  render() {
    return React.createElement(
      Provider,
      /*<% GLOBAL_MODELS %>*/
      this.props.children
    );
  }
}
