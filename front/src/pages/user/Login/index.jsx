import { Button } from 'antd';
import { useState } from 'react';
import Footer from '@/components/Footer';
import styles from './index.less';
import Web3 from 'web3';
import { getNonce, currentUser, signup, sign } from '@/services/web3chat/api';

const Login = () => {
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
    
    const publicAddress = coinbase.toLowerCase();
    setLoading(true);

    const user = await signup({address: publicAddress});
    console.log(user);
    const nonce = await getNonce({address: publicAddress});
    await currentUser({address: publicAddress}).then((response) => {
      console.log(response);
      setType(response);
    });

    // web3.eth.sign
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
