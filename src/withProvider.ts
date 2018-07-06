import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { getType, IStateTreeNode } from 'mobx-state-tree';
import { runInAction } from 'mobx';

export default function getHoc(stores: {
  [key: string]: () => Promise<IStateTreeNode>
}, loading: React.ComponentType<any> = () => null) {
  return function withProvider<P>(routeComponent: React.ComponentType<RouteComponentProps<P>>) {

    class withRouterComponent extends React.Component<RouteComponentProps<P>> {

      mounted: boolean = false;
      Loading: React.ComponentType<any> = loading;
      state: {
        resolvedStores: {
          [key: string]: IStateTreeNode
        } | null
      } = {
          resolvedStores: null
        };

      componentDidMount() {
        this.mounted = true;
      }

      componentWillUnmount() {
        this.mounted = false;
      }

      constructor(props: any) {
        super(props);
        this.load();
      }

      async load() {
        const resolvedStores: {
          [key: string]: IStateTreeNode
        } = {};
        const keys = Object.keys(stores);

        for (const key of keys) {
          const store = stores[key];
          try {
            const resolved = await store();
            resolvedStores[
              getType(resolved).name === 'AnonymousModel' ? key : getType(resolved).name
            ] = resolved; // or resolved.default
          } catch (e) {
            console.error('Fail to resolve store, the store should be () => import("..."), but got ', store);
          }
        }

        if (this.mounted) {
          this.setState({
            resolvedStores
          });
        } else {
          this.state.resolvedStores = resolvedStores;
        }

        return resolvedStores;
      }

      render() {
        if (this.state.resolvedStores) {
          return React.createElement(
            Provider,
            this.state.resolvedStores,
            React.createElement(
              routeComponent,
              this.props,
              this.props.children
            )
          );
        } else {
          return React.createElement(
            this.Loading,
            this.props,
            this.props.children
          );
        }

      }
    }

    (withRouterComponent as React.ComponentClass<RouteComponentProps<P>>).displayName = 'withRouterComponent';

    return withRouterComponent as React.ComponentClass<RouteComponentProps<P>>;
  }
}
