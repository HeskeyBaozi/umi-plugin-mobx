import { Provider } from 'mobx-react';
import { getType, IStateTreeNode } from 'mobx-state-tree';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface IStores {
  [key: string]: () => Promise<IStateTreeNode>;
}

export default function getHoc(stores: IStores, loading: React.ComponentType<any> = () => null) {
  return function withProvider<P>(routeComponent: React.ComponentType<RouteComponentProps<P>>) {

    class WithRouterComponent extends React.Component<RouteComponentProps<P>> {
      mounted: boolean = false;
      Loading: React.ComponentType<any> = loading;
      state: {
        resolvedStores: {
          [key: string]: IStateTreeNode
        } | null
      } = {
          resolvedStores: null
        };

      constructor(props: any) {
        super(props);
        this.load();
      }

      componentDidMount() {
        this.mounted = true;
      }

      componentWillUnmount() {
        this.mounted = false;
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

    (WithRouterComponent as React.ComponentClass<RouteComponentProps<P>>).displayName = 'withRouterComponent';

    return WithRouterComponent as React.ComponentClass<RouteComponentProps<P>>;
  };
}
