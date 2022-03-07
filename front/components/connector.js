import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { getNonce, login, signup } from '../lib/api'
import Router from 'next/router'

export const Connector = () => {
  const [{ data: connectData, error: connectError, loading }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  const [{ data, error, loading: signLoading }, signMessage] = useSignMessage()

  const handleClick = async (connector) => {
    await connect(connector);
    const address = accountData?.address;
    var res = null;
    res = await signup({ address: address });
    res = await getNonce({ address: address });
    var nonce = res.data;
    await signMessage(`I am signing my one-time nonce: ${nonce}`);
    if (!data) {
      alert('You need to sign the message to be able to log in.');
      return;
    }
    
    res = await sign(JSON.stringify({ address, signature }));
    if (res.status.status !== 'ok') {
      alert('sign error message.');
      return;
    }
    // save the jwt token in localStorage
    if (res.status.status == 'ok') {
      const token = res.data;
      window.localStorage.setItem('token', token);
    }
    // log in
    res = await login(address);
    if (res && res.status.status === 'ok') {
      alert('logged in.')
      Router.push('/profile');
    }
  }

  return (
    <div>
      {connectData.connectors.map((connector) => (
        <button
          // hidden={accountData}
          key={connector.id}
          onClick={() => handleClick(connector)}
        >
          {(loading || signLoading) ? 'Loading...' : 'Login with ' + connector.name}
          {!connector.ready && ' (unsupported)'}
        </button>
      ))}

      {/* {connectError && <div>{connectError?.message ?? 'Failed to connect'}</div>} */}
    </div>
  )
}
