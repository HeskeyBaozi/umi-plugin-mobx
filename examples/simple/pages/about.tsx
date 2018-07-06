// tslint:disable
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { UserType } from '../stores/user';
import { observable, action, computed } from 'mobx';

interface AboutProps {
  user?: UserType;
}

@inject('user')
@observer
export default class About extends React.Component<AboutProps> {

  @observable
  count = 15;

  @action
  handleChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.props.user!.changeFirstName(e.currentTarget.value)
  }

  @action
  up = () => {
    console.log('click to ', this.count);
    this.count++;
  }

  handleClickAddItem: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const { user } = this.props;
    await user!.addListItemAsync();
    console.log('add, uid = ', user!.uid);
  }

  @computed
  get List() {
    const { user } = this.props;
    return user!.list.map((item) => (
      <li key={ item.key }>
        [{ item.key }]: { item.content }
      </li>
    ));
  }


  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Name: { this.props.user!.name }</p>
        <input type="text" value={ this.props.user!.firstName } onChange={ this.handleChangeInput } />
        <p>count: { this.count }</p>
        <button onClick={ this.up }>count++</button>
        <p>List: <button onClick={ this.handleClickAddItem }>Add Item</button></p>
        <ul>
          { this.List }
        </ul>
      </div>
    );
  }
}
