import { useEffect, useState } from 'react';
import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

const Test = () => {
  const [ {data: connectData }, connect ] = useConnect();
  const [ {data: account }, disconnect ] = useAccount();

  const [ maskAddress, setMaskAddress ] = useState(null);

  useEffect(() => {
    if (account) {
      setMaskAddress(
        account.address.substr(0, 6) + '...' + account.address.substr(-4,4)
      );
    }
  }, [connectData.connected])

  const connectWallet = () => {
    connect(new InjectedConnector());
  }

  return (
    <>
      <h1>Test</h1>
      {connectData.connected ? <p>{maskAddress}</p> : <div>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>}
      {connectData.connected ? <button onClick={disconnect}>Disconnect</button> : null}
    </>
  )
}


export default Test;