import { Avatar, List, Input, Grid } from 'antd';
import { useState } from 'react';
import styles from './chat.module.css'

const Item = List.Item
const { Search } = Input;

const Chat = ({ messages, user }) => {

  const [ showExtra, setShowExtra ] = useState(false);
  const [ content, setContent ] = useState('');

  const handleShow = () => {

  }

  const handleChange = (evt) => {
    console.log('change', evt.target.value);
    setContent(evt.target.value);
  }

  const handleSend = () => {
    console.log('send!');
    document.getElementById('input').value = '';
    setContent('');
  }

  return (
    <>
      <div id='log' className={styles.log}>
        {
        messages?(
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={item => (
            <Item>
              <Item.Meta
                avatar={<Avatar size="small" src="https://joeschmoe.io/api/v1/random" />}
                title={<a href={"/u/" + item.username}>{item.username}</a>}
                description={item.content}
              />
            </Item>
          )}
        />):null
      }
      </div>
    {
      <div>
        {/* <Input
          allowClear={true}
          placeholder='text here'
          onChange={handleChange}
        /> */}
        <input id='input' placeholder='text here' onChange={handleChange} />
        <button type="primary" onClick={handleSend}>Send</button>
        {/* showExtra?(
          <Grid
            
          />
        ):null */}
      </div>
    }
    </>
  )
}

export default Chat;