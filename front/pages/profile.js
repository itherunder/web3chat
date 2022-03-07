import Layout from '../components/layout';
import { currentUser as queryCurrentUser, checkUsername as checkUsernameIsFree, updateProfile } from '../lib/api'
import Router from 'next/router'
import { useEffect, useState } from 'react';

function Profile() {
  const [ currentUser, setCurrentUser ] = useState(undefined);
  const getInitialState = async (token) => {
    var res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    setCurrentUser(res.data);
  }

  useEffect(() => {
    var token = null;
    if (typeof window != undefined) {
      token = window.localStorage.getItem('token');
    }
    if (!currentUser) {
      getInitialState(token);
    }
  });

  const handleUpdate = async () => {
    var token = window.localStorage.getItem('token');
    var newUsername = document.getElementById('username').value;
    var res = null;
    res = await checkUsernameIsFree({username: newUsername}, token);
    var isFree = res.data.result;
    if (newUsername == '' || !isFree) {
      alert('username is not free');
      return;
    }
    res = await updateProfile({
      'address': currentUser?.address,
      'username': newUsername,
    }, token);
    if (res.status.status === 'ok') {
      await getInitialState(token);
    } else {
      alert('update profile error');
    }
    document.getElementById('username').value = '';
  }

  return (
    <>
      <Layout>
        <h3>Address: {currentUser?.address}</h3>
        <h3>Username: {currentUser?.username}</h3>
        <input type="text" id='username' placeholder='new username here' />
        <br />
        <button type='primary' onClick={handleUpdate}>Update Username</button>
      </Layout>
    </>
  );
}

export default Profile;