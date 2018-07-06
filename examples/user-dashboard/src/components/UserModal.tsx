import { Form, Input, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { UserType } from '../pages/users/stores/$user';

// tslint:disable:jsx-no-multiline-js

const FormItem = Form.Item;

interface IUserModalProps extends FormComponentProps {
  record: Partial<UserType>;
  onOk: (value: any) => void;

}

@observer
class UserEditModal extends React.Component<IUserModalProps> {

  @observable
  visible = false;

  @action
  showModelHandler = () => {
    this.visible = true;
  }

  @action
  hideModelHandler = () => {
    this.visible = false;
  }

  okHandler = () => {
    const { onOk } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        onOk(values);
        this.hideModelHandler();
      }
    });
  }

  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { name, email, website } = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 }
    };

    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
        </span>
        <Modal
          title='Edit User'
          visible={this.visible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Form onSubmit={this.okHandler}>
            <FormItem
              {...formItemLayout}
              label='Name'
            >
              {
                getFieldDecorator('name', {
                  initialValue: name
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='Email'
            >
              {
                getFieldDecorator('email', {
                  initialValue: email
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='Website'
            >
              {
                getFieldDecorator('website', {
                  initialValue: website
                })(<Input />)
              }
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

export default Form.create()(UserEditModal);
