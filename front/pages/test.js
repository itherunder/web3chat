import { useEffect, useState } from 'react';
import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import Layout from '../components/layout'

const Test = () => {
  const [ {data: connectData }, connect ] = useConnect();
  const [ {data: account }, disconnect ] = useAccount();
  const connector = account?.connector;

  const [ maskAddress, setMaskAddress ] = useState(null);

  useEffect(() => {
    console.log('connectData.connected changed: ', connectData.connected);
    if (account) {
      setMaskAddress(
        account.address.substr(0, 6) + '...' + account.address.substr(-4,4)
      );
    }
  }, [connectData.connected])

  useEffect(() => {
    const onChange = (data) => {
      console.log('account changed: ', data);
    }

    connector?.on('change', onChange);
    return () => {
      if (!connector) return;
      connector.off('change', onChange);
    }
  }, []);

  const connectWallet = () => {
    connect(new InjectedConnector());
  }

  return (
    <>
      <Layout>
        <h1>Test</h1>
        {connectData.connected ? <p>{maskAddress}</p> : <div>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>}
        {connectData.connected ? <button onClick={disconnect}>Disconnect</button> : null}
      </Layout>
    </>
  )
}


export default Test;