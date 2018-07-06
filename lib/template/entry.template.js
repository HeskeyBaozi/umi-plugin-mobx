import * as React from 'react';
import { Provider } from 'mobx-react';
import { getType } from 'mobx-state-tree';
import { configure } from 'mobx';

configure(/*<% MOBX_CONFIG %>*/);

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
