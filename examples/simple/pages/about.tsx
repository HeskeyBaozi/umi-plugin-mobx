import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { UserType } from '../stores/user';
import { observable, action } from 'mobx';

interface AboutProps {
  user?: UserType;
}

@inject('user')
@observer
export default class About extends React.Component<AboutProps> {

  @observable
  count = 0;

  @action
  handleChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.props.user!.changeFirstName(e.currentTarget.value)
  }

  @action
  up = () => {
    console.log('click to ', this.count);
    this.count++;
  }


  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Name: {this.props.user!.name}</p>
        <input type="text" value={this.props.user!.firstName} onChange={this.handleChangeInput} />
        <p>count: {this.count}</p>
        <button onClick={this.up}>count++</button>
      </div>
    );
  }
}
