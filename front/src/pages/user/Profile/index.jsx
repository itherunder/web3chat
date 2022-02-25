import { Form, Input, Button } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import { useModel, history } from 'umi'


const Profile = () => {
  const [type, setType] = useState("user");
  const { initialState, setInitialState } = useModel('@@initialState');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Profile</h1>
        <br/>
        address: <h1>{initialState?.currentUser?.Address}</h1>
        <br/>
        username: <input placeholder={initialState?.currentUser?.Username}></input>
        <br/>
        <Button type='primary' onClick={handleUpdate} >
          Update Profile
        </Button>
        <br/>
        <Button type='primary' onClick={() => {history.push('/app/search')}} >
          Search Chat
        </Button>
      </div>
    </div>
  );
};

export default Profile;
