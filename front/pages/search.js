import Layout from "../components/layout";
import { Creator } from "../components/creator";
import Router from 'next/router'
import { useState, useEffect } from "react";
import { currentUser as queryCurrentUser, searchRoom as querySearchRoom, createRoom as queryCreateRoom, signCreateRoom } from '../lib/api';
import { Input, Space } from 'antd';
import { useConnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

function Search_() {
  const [ roomName, setRoomName ] = useState('');
  const [ clear, setClear ] = useState(false);
  const [ token, setToken ] = useState('');
  const [ currentUser, setCurrentUser ] = useState(undefined);
  const [ display, setDisplay ] = useState(false);
  const [ { data: connectData, error: connectError }, connect ] = useConnect();

  const getInitialState = async (token) => {
    if (!connectData.connected) {
      await connect(new InjectedConnector());
    }
    let res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    setCurrentUser(res.data);
    setToken(token);
  }

  useEffect(() => {
    if (typeof window != undefined) {
      var token_ = window.localStorage.getItem('token');
    }
    if (!currentUser) {
      getInitialState(token_);
    }
  }, [connectData.connected]);

  const handleChange = (event) => {
    setRoomName(event.target.value);
    if (event.target.value == '') {
      setClear(false);
    } else {
      setClear(true);
    }
  }

  const handleSearch = async () => {
    if (roomName == '') {
      alert('room name can not be null');
      return;
    }
    let res = await querySearchRoom({roomName: roomName});
    console.log(res);
    // no this room
    if (!res.data.result) {
      let create = confirm('No such room, create this room?');
      if (create) {
        setDisplay(true);
      }
      return;
    }
    // have this room
    history.push('/room/' + roomName);
  };

  return (
    <>
      <Layout>
        <h1>Search</h1>
        <Space direction="vertical">
          <Input
            allowClear={true}
            placeholder="input room"
            size="large"
            onChange={handleChange}
          />
          <button type="primary" onClick={handleSearch}>Search</button>
        </Space>
        <Creator {...{currentUser, roomName, token, display, setDisplay}} />
      </Layout>
    </>
  );
}

export default Search_;