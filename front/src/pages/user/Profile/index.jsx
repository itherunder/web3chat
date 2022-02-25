import { Button } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import Web3 from 'web3';
import { getNonce, currentUser as queryCurrentUser, signup, sign } from '@/services/web3chat/api';
import { useModel } from 'umi'

const Profile = () => {
  const [type, setType] = useState("user");
  let web3 = undefined;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Profile</h1>
      </div>
    </div>
  );
};

export default Profile;
