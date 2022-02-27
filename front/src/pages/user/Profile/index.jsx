import { Form, Input, Button } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import { useModel, history } from 'umi'
import { checkUsername as checkUsernameIsFree, updateProfile } from '@/services/web3chat/api';


const Profile = () => {
  const [type, setType] = useState("user");
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleUpdate = async () => {
    let newUsername = document.getElementById('username').value;
    let response = null;
    console.log('new username:', newUsername);
    response = await checkUsernameIsFree({username: newUsername});
    let isFree = response.result;
    if (newUsername == '' || !isFree) {
      alert('username is not free');
      return;
    }
    response = await updateProfile({
      'address': initialState?.currentUser?.Address,
      'username': newUsername,
    });
    console.log('update profile', response);
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Profile</h1>
        <br/>
        address: <h1>{initialState?.currentUser?.Address}</h1>
        <br/>
        username: <input type="text" id='username' placeholder={initialState?.currentUser?.Username} /**onChange={checkUsername} */></input>
        <br/>
        <Button type='primary' onClick={handleUpdate} >
          Update Profile
        </Button>
        <br/>
        <Button type='primary' onClick={() => {history.push('/room/search')}} >
          Search Chat
        </Button>
      </div>
    </div>
  );
};

export default Profile;
