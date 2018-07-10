import * as React from 'react';
import { Provider } from 'mobx-react';
import { getType } from 'mobx-state-tree';
import { configure } from 'mobx';

configure(/*<% MOBX_CONFIG %>*/);

/*<% MOBX_STORES %>*/

MobxModelProvider.displayName = 'MobxModelProvider';
export default function MobxModelProvider(props) {
  return React.createElement(
    Provider,
    /*<% GLOBAL_MODELS %>*/
    props.children
  );
}
