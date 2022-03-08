import Layout from '../components/layout';
import { Loginer } from '../components/loginer';
import { useConnect, useAccount } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { currentUser as queryCurrentUser } from '../lib/api'
import Router from 'next/router'
import { useEffect, useState } from 'react';

function Login() {
  const [ { data: connectData, error: connectError }, connect ] = useConnect();

  const getInitialState = async (token) => {
    await connect(new InjectedConnector());
    if (connectError) {
      alert('connect error');
      return;
    }
    let res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      return;
    }
    alert('logged in.')
    Router.push('/search');
  }

  useEffect(() => {
    var token = null;
    if (typeof window != undefined) {
      token = window.localStorage.getItem('token');
    }
    getInitialState(token);
  }, [connectData.connected]);

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