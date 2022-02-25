import { Input, Space } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import { history } from 'umi';
import Web3 from 'web3';
import { getNonce, currentUser, login, signup, sign } from '@/services/web3chat/api';

const SearchChat = () => {
  const { Search } = Input;
  const onSearch = async () => {
    
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Search</h1>
        <Space direction="vertical">
          <Search
            placeholder="input search text"
            allowClear
            enterButton="Search"
            size="large"
            onSearch={onSearch}
          />
        </Space>
      </div>
    </div>
  );
};

export default SearchChat;
