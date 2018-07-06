import { Button, Pagination, Popconfirm, Table } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import UserModal from '../../components/UserModal';
import styles from './index.less';
import { UserSnapshotType, UserType } from './stores/$user';
import { UsersType } from './stores/users';

interface IUsersPageProps {
  users?: UsersType;
}

function deleteHandler(id: number) {
  console.warn(`TODO: ${id}`);
}

@inject('users')
@observer
export default class UsersPage extends React.Component<IUsersPageProps> {

  handleDeleteUser = async (id: number) => {
    const { users } = this.props;
    await users!.removeAsync({ id });
    await users!.fetchAsync({ page: users!.page! });
  }

  handleEditUser = async (id: number, values: {
    name: string,
    email: string,
    website: string
  }) => {
    const { users } = this.props;
    await users!.updateAsync({ id, values });
    await users!.fetchAsync({ page: users!.page! });
  }

  handleCreateUser = async (values: {
    name: string,
    email: string,
    website: string
  }) => {
    const { users } = this.props;
    await users!.createAsync({ values });
    await users!.fetchAsync({ page: users!.page! });
  }

  get columns(): Array<ColumnProps<UserType>> {
    return [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href=''>{text}</a>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website'
    },
    {
      title: 'Operation',
      key: 'operation',
      render: (text, record) => (
        <span className={styles.operation}>
          <UserModal record={record} onOk={this.handleEditUser.bind(null, record.id)}>
            <a>Edit</a>
          </UserModal>
          <Popconfirm title='Confirm to delete?' onConfirm={this.handleDeleteUser.bind(null, record.id)}>
            <a>Delete</a>
          </Popconfirm>
        </span>
      )
    }];
  }

  async componentDidMount() {
    const { users } = this.props;
    users!.fetchAsync({ page: 1 });
  }

  handlePaginationChange = (page: number, pageSize?: number) => {
    const { users } = this.props;
    users!.fetchAsync({ page });
  }

  render() {
    const { users } = this.props;
    const rowKey = (record: UserType) => record.id.toString();
    return (
      <div className={styles.normal}>
        <div>
          <div className={styles.create}>
            <UserModal record={{}} onOk={this.handleCreateUser}>
              <Button type='primary'>Create User</Button>
            </UserModal>
          </div>
          <Table
            columns={this.columns}
            dataSource={users!.list}
            rowKey={rowKey}
            pagination={false}
            loading={Boolean(users!.loading.size)}
          />
          <Pagination
            className='ant-table-pagination'
            total={users!.total || 0}
            current={users!.page || 0}
            pageSize={users!.PAGE_SIZE}
            onChange={this.handlePaginationChange}
          />
        </div>
      </div>
    );
  }
}
