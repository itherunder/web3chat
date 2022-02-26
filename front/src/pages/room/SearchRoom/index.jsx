import { Input, Space } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import { history, useModel } from 'umi';
import Web3 from 'web3';
import { searchRoom as querySearchRoom, createRoom as queryCreateRoom, signCreateRoom } from '@/services/web3chat/api';
// import { }

const SearchRoom = () => {
  const [ roomName, setRoomName ] = useState('');
  const [ address, setAddress ] = useState('');
  const { Search } = Input;
  const { initialState, setInitialState } = useModel('@@initialState');

  const signToCreateRoom = async () => {
    try {
      await window.ethereum.enable();
      web3 = new Web3(window.ethereum);
    } catch (error) {
      console.error(error);
      alert('You need to allow MetaMask.');
      return;
    }
  
    const coinbase = await web3.eth.getCoinbase();
    if (!coinbase) {
      alert('Please activate MetaMask first.');
      return;
    }
    
    const address = coinbase.toLowerCase();
    setAddress(address);
    
    let signature = '';
    try {
      signature = await web3.eth.personal.sign(
        `I am creating room: ${roomName.toLowerCase()}`,
        address,
        ''
      );
    } catch (err) {
      alert('You need to sign the message to be able to log in.');
      return;
    }
    let response = await signCreateRoom(JSON.stringify({address, roomName, signature}));
    if (response.data.status != 'ok') {
      alert('sign error message.');
      return;
    }
  }

  const createRoom = async () => {
    await queryCreateRoom(JSON.stringify({roomName, address, }))
  }

  const onChange = (event) => {
    setRoomName(event.target.value);
  }
  const onSearch = async () => {
    let response = await querySearchRoom({roomName: roomName});
    // no this room
    if (!response.result) {
      let create = confirm('Create this room?');
      if (create) {
        // sign the message first
        let respones = await signToCreateRoom();
        if (response.data.status != 'ok') {
          alert(response.data.extra_msg);
          return;
        }
        response = await queryCreateRoom(JSON.stringify({roomName, address}));
        // create success and redirect to this room
        if (response.data.status == 'ok') {
          history.push('/room/' + roomName);
        }
      }
      return;
    }
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
            onChange={onChange}
            onSearch={onSearch}
          />
        </Space>
      </div>
    </div>
  );
};

export default SearchRoom;