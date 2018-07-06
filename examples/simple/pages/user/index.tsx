// tslint:disable
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';

@inject('testPageStoreInnerName')
@observer
export default class UserList extends React.Component<any> {

  @observable
  searchText;

  componentDidMount() {
    setInterval(() => {
      runInAction('debugName', () => {
        if(this.searchText) {
          this.searchText += 1;
        } else {
          this.searchText = 2;
        }
      })
    }, 1000);
  }

  render() {
    return (
      <div>UserList + {this.props.testPageStoreInnerName.count}, local = {this.searchText}</div>
    );
  }
}
