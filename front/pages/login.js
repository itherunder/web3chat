import Layout from '../components/layout';
import { Connector } from '../components/connector';
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { currentUser as queryCurrentUser } from '../lib/api'
import Router from 'next/router'
import { useEffect, useState } from 'react';

function Login() {
  const [ currentUser, setCurrentUser ] = useState(null)
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
  }, [currentUser]);

  return (
    <>
      <Layout>
        <h1>Login</h1>
        <Provider autoConnect connectors={connectors}>
          <Connector />
        </Provider>
      </Layout>
    </>
  );
}

export default Login;