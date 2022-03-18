import Layout from '../components/layout';
import { Loginer } from '../components/loginer';
import { useConnect, useAccount } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { currentUser as queryCurrentUser } from '../lib/api'
import Router from 'next/router'
import { useEffect, useState } from 'react';

function Login() {
  const [ { data: connectData, error: connectError }, connect ] = useConnect();
  const [ { data: account }, disconnect ] = useAccount();

  const getInitialState = async (token) => {
    await connect(new InjectedConnector());
    if (connectError) {
      alert('connect error');
      return;
    }
    let res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      // if (account.address.toLowerCase() != res.user.address.toLowerCase()) {
      //   alert('please change ur wallet address!');
      // }
      return;
    }
    alert('logged in.')
    Router.push('/search');
  }

  return (
    <>
      <Layout>
        <h1>Login</h1>
        <Loginer />
      </Layout>
    </>
  );
}

export default Login;