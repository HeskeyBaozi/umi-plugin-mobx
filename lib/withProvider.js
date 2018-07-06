import { Component, createElement } from 'react';
import { Provider } from 'mobx-react';
import { getType } from 'mobx-state-tree';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function getHoc(stores, loading = () => null) {
    return function withProvider(routeComponent) {
        class withRouterComponent extends Component {
            constructor(props) {
                super(props);
                this.mounted = false;
                this.Loading = loading;
                this.state = {
                    resolvedStores: null
                };
                this.load();
            }
            componentDidMount() {
                this.mounted = true;
            }
            componentWillUnmount() {
                this.mounted = false;
            }
            load() {
                return __awaiter(this, void 0, void 0, function* () {
                    const resolvedStores = {};
                    const keys = Object.keys(stores);
                    for (const key of keys) {
                        const store = stores[key];
                        try {
                            const resolved = yield store();
                            resolvedStores[getType(resolved).name === 'AnonymousModel' ? key : getType(resolved).name] = resolved; // or resolved.default
                        }
                        catch (e) {
                            console.error('Fail to resolve store, the store should be () => import("..."), but got ', store);
                        }
                    }
                    if (this.mounted) {
                        this.setState({
                            resolvedStores
                        });
                    }
                    else {
                        this.state.resolvedStores = resolvedStores;
                    }
                    return resolvedStores;
                });
            }
            render() {
                if (this.state.resolvedStores) {
                    return createElement(Provider, this.state.resolvedStores, createElement(routeComponent, this.props, this.props.children));
                }
                else {
                    return createElement(this.Loading, this.props, this.props.children);
                }
            }
        }
        withRouterComponent.displayName = 'withRouterComponent';
        return withRouterComponent;
    };
}

export default getHoc;
