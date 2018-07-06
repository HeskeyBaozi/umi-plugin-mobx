import { Icon, Menu } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Link from 'umi/link';
import withRouter from 'umi/withRouter';
import styles from './index.less';

class Layout extends React.Component<RouteComponentProps<{}>> {
  render() {
    const { children, location } = this.props;
    return (
      <div className={styles.normal}>
        <Menu
          selectedKeys={[location.pathname]}
          mode='horizontal'
          theme='dark'
        >
          <Menu.Item key='/'>
            <Link to='/'><Icon type='home' />Home</Link>
          </Menu.Item>
          <Menu.Item key='/users'>
            <Link to='/users'><Icon type='bars' />Users</Link>
          </Menu.Item>
          <Menu.Item key='/umi'>
            <a href='https://github.com/umijs/umi' target='_blank'>umi</a>
          </Menu.Item>
          <Menu.Item key='/umi-plugin-mobx'>
            <a href='https://github.com/HeskeyBaozi/umi-plugin-mobx' target='_blank'>umi-plugin-mobx</a>
          </Menu.Item>
          <Menu.Item key='/404'>
            <Link to='/page-you-dont-know'><Icon type='frown-circle' />404</Link>
          </Menu.Item>
        </Menu>
        <div className={styles.content}>
          <div className={styles.main}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Layout);
