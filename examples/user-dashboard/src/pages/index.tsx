import { observer } from 'mobx-react';
import * as React from 'react';
import styles from './index.less';

@observer
export default class IndexPage extends React.Component<{}> {
  render() {
    return (
      <div className={styles.normal}>
        <h1 className={styles.title}>Yay! Welcome to umi-plugin-mobx!</h1>
        <div className={styles.welcome} />
        <ul className={styles.list}>
          <li>To get started, edit <code>src/pages/index.tsx</code> and save to reload.</li>
          <li><a href={'https://github.com/HeskeyBaozi/umi-plugin-mobx'}>Getting Started</a></li>
        </ul>
      </div>
    );
  }
}
