import Layout from "../components/layout";
import { Creator } from "../components/creator";
import Router from 'next/router'
import { useState, useEffect } from "react";
import { currentUser as queryCurrentUser, searchRoom as querySearchRoom, createRoom as queryCreateRoom, signCreateRoom } from '../lib/api';
import { Input, Space } from 'antd';
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Connector } from "../components/connector";

// todo: deliver state to son component
function Search_() {
  const [ roomName, setRoomName ] = useState('');
  const [ clear, setClear ] = useState(false);
  const [ token, setToken ] = useState('');
  const [ currentUser, setCurrentUser ] = useState(undefined);
  const [ display, setDisplay ] = useState(true);

  const infuraId = process.env.INFURA_ID
  const chains = defaultChains
  const connectors = ({ chainId }) => {
    const rpcUrl =
      chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
      chain.mainnet.rpcUrls[0]
    return [
      new InjectedConnector({
        chains,
        options: { shimDisconnect: true },
      }),
    ]
  }

  const getInitialState = async (token) => {
    let res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    setCurrentUser(res.data);
    setToken(token);
  }

  useEffect(() => {
    if (token != '' && currentUser) return;
    if (typeof window != undefined) {
      var token_ = window.localStorage.getItem('token');
    }
    if (!currentUser) {
      getInitialState(token_);
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
    let res = await signCreateRoom(JSON.stringify({address, roomName, signature}));
    if (res.data.status != 'ok') {
      alert('sign error message.');
      return;
    }
  }

  const handleChange = (event) => {
    setRoomName(event.target.value);
    console.log(event.target.value);
    if (event.target.value == '') {
      setClear(false);
    } else {
      setClear(true);
    }
  }

  const handleSearch = async () => {
    let res = await querySearchRoom({roomName: roomName});
    console.log(res);
    // no this room
    if (!res.data.result) {
      let create = confirm('Create this room?');
      if (create) {
        
        // sign the message first
        let res = await signToCreateRoom();
        if (res.data.status != 'ok') {
          alert(res.data.extra_msg);
          return;
        }
        res = await queryCreateRoom(JSON.stringify({roomName, address}));
        // create success and redirect to this room
        if (res.data.status == 'ok') {
          history.push('/room/chat/' + roomName);
        }
      }
      return;
    }
    // have this room
    history.push('/room/chat/' + roomName);
  };

  return (
    <>
      <Layout>
        <h1>Search</h1>
        <Space direction="vertical">
          <Input
            allowClear={true}
            placeholder="input room"
            enterButton="Search"
            size="large"
            onChange={handleChange}
          />
          <button type="primary" onClick={handleSearch}>Search</button>
        </Space>
        {/* <Creator /> */}
        <Provider autoConnect connectors={connectors}>
          <Creator {...{currentUser, roomName, token, display}} />
        </Provider>
      </Layout>
    </>
  );
}

export default Search_;