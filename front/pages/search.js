import Layout from "../components/layout";
import Router from 'next/router'
import { useState, useEffect } from "react";
import { searchRoom as querySearchRoom, createRoom as queryCreateRoom, signCreateRoom } from '../lib/api';
import { Input, Space } from 'antd';
const { Search } = Input;

function Search_() {
  const [ roomName, setRoomName ] = useState('');
  const [ currentUser, setCurrentUser ] = useState(undefined);

  const getInitialState = async (token) => {
    let res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    setCurrentUser(res.data);
  }

  useEffect(() => {
    var token = null;
    if (typeof window != undefined) {
      token = window.localStorage.getItem('token');
    }
    if (!currentUser) {
      getInitialState(token);
    }
  });

  const signToCreateRoom = async () => {
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

  const handleChange = (event) => {
    setRoomName(event.target.value);
  }

  const handleSearch = async () => {
    let response = await querySearchRoom({roomName: roomName});
    console.log(response);
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
          history.push('/room/chat/' + roomName);
        }
      }
      return;
    }
    // have this room
    history.push('/room/chat/' + roomName);
  };

  return (
    <div>
      <Layout>
        <h1>Search</h1>
        <Space direction="vertical">
          <Search
            placeholder="input search text"
            allowClear
            enterButton="Search"
            size="large"
            onChange={handleChange}
            onSearch={handleSearch}
          />
        </Space>
      </Layout>
    </div>
  );
}

export default Search_;