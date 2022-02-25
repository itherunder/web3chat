import { Button } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import { history, useModel } from 'umi';
import Web3 from 'web3';
import { getNonce, currentUser, login, signup, sign } from '@/services/web3chat/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState({});
  const { initialState, setInitialState } = useModel('@@initialState');
  let web3 = undefined;

  const initialStatus = async (address) => {
    // const token = window.localStorage.getItem('token');
    // let response = null;
    // if (token != null) {
    //   response = await login();
    //   // can log in with jwt token, no need to sign message
    //   if (response.data.status == 'ok') {
    //     return response;
    //   }
    // }
    try {
      const response = await login({address: address});
      return response;
    } catch (error) {
      return null;
    }
  }

  const handleClick = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask first.');
      return;
    }

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
    setLoading(true);

    // try login then sign message
    let response = null;
    response = await initialStatus(address);
    // logged in
    if (response != null && response.data.status == 'ok') {
      console.log('logged in!');
      await getInitialState();
      setLoading(false);
      history.push('/user/profile');
      return;
    }

    response = await signup({address: address});
    response = await getNonce({address: address});
    var nonce = response.data;
    let signature = '';
    try {
      signature = await web3.eth.personal.sign(
        `I am signing my one-time nonce: ${nonce}`,
        address,
        ''
      );
    } catch (err) {
      alert('You need to sign the message to be able to log in.');
      setLoading(false);
      return;
    }
    response = await sign(JSON.stringify({address, signature}));
    if (response.data.status != 'ok') {
      alert('sign error message.');
      setLoading(false);
      return;
    }
    setLoading(false);
    // save the jwt token in localStorage
    if (response.data.status == 'ok') {
      const token = response.token;
      window.localStorage.setItem('token', token);
    }
    // then login
    response = await initialStatus(address);
    // logged in
    if (response != null && response.data.status == 'ok') {
      console.log('logged in!');
      history.push('/user/profile');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Button type='primary' onClick={handleClick} >
          {loading ? 'Loading...' : 'Login with MetaMask'}
        </Button>
        <br/>
        <Button type='primary' onClick={() => {history.push('/user/profile')}} >
          profile
        </Button>
      </div>
    </div>
  );
};

export default Login;
