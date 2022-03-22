import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { getNonce, login, signup, signLogin } from '../lib/api'
import Router from 'next/router'
import { useEffect, useState } from 'react'

const Loginer = () => {
  const [{ data: connectData, error: connectError, loading: connectLoading }, connect] = useConnect()
  const [{ data: account }, disconnect] = useAccount()
  const [{ data: signData, error: signError, loading: signLoading }, signMessage] = useSignMessage()

  const tryLogin = async (address, token) => {
    console.log('tryLogin')
    var res = await login({address}, token);
    if (res && res.status.status == 'ok') {
      alert('logged in.')
      Router.push('/search');
    }
  }

  useEffect(() => {
    if (!connectData.connected || !account) {
      connect(new InjectedConnector());
      return;
    }
    var token = window.localStorage.getItem('token');
    tryLogin(account.address, token);
  }, [connectData.connected])

  const handleClick = async () => {
    await connect(new InjectedConnector());
    const address = account?.address;
    var res = null;
    res = await signup({ address: address });
    res = await getNonce({ address: address });
    var nonce = res.data;
    res = await signMessage({message: `I am signing my one-time nonce: ${nonce}`});
    if (res.error) {
      alert('You need to sign the message to be able to log in.');
      return;
    }
    var signature = res.data;
    
    res = await signLogin(JSON.stringify({ address, signature }));
    if (res.status.status != 'ok') {
      alert('sign error message.');
      return;
    }
    // save the jwt token in localStorage
    var token = res.data;
    window.localStorage.setItem('token', token);
    // log in
    res = await login({address}, token);
    if (res && res.status.status == 'ok') {
      alert('logged in.')
      Router.push('/search');
    }
  }

  return (
    <>
      <button onClick={handleClick}>
        {(connectLoading || signLoading) ? 'Loading...' : 'Login with MetaMask'}
      </button>
    </>
  )
}

export default Loginer;