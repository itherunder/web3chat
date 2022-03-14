// login status component
import { Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { useConnect, useAccount, useSignMessage } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import Router from 'next/router';

const Header = (user, connectData, account) => {
  const [ showExtra, setShowExtra ] = useState(false);
  const [ loginStatus, setLoginStatus ] = useState(true);

  useEffect(() => {
    if (loginStatus) return;
    // login status changed to logout
    if (typeof window != undefined) {
      window.localStorage.setItem('token', '');
    } else {
      alert('logout failed, please try again!');
      setLoginStatus(true);
      return;
    }
    Router.push('/login')
  }, [loginStatus]);

  useEffect(() => {
    
  }, [connectData.connected]);

  return (
    <div id='profile' onMouseMove={setShowExtra(true)} onMouseOut={setShowExtra(false)}>
      <Avatar
        size="small"
        src="https://joeschmoe.io/api/v1/random"
      />
      <span>{user.username}</span>
      {
        showExtra?(
          <div>
            <button id='logout' onClick={setLoginStatus(false)}>log out</button>
            <button id='profile' onClick={Router.push('/profile')}>profile</button>
          </div>
        ):null
      }
    </div>
  )
}

export default Header;