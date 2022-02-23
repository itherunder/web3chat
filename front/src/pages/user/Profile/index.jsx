import { Button } from 'antd';
import { useState } from 'react';
import Footer from '@/components/Footer';
import styles from './index.less';
import Web3 from 'web3';
import { getNonce, currentUser, signup, sign } from '@/services/web3chat/api';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("user");
  let web3 = undefined;

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
    let response = null;

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
      return;
    }
    response = await sign(JSON.stringify({address, signature}));
    if (response.data.status != "ok") {
      alert('sign error message.');
      return;
    }
    setLoading(false);
    // save the jwt token in localStorage
    
  };

  return (
    <div className={styles.container}>
      <Button type='primary' onClick={handleClick} >
        {loading ? 'Loading...' : 'Login with MetaMask'}
      </Button>
      <Footer />
    </div>
  );
};

export default Login;
