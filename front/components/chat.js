import { Avatar, List, Input, Grid, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './chat.module.css'

const Item = List.Item
const { Search } = Input;

const Chat = ({ messages, setMessages, user, token }) => {
  const [ showExtra, setShowExtra ] = useState(false);
  const [ content, setContent ] = useState('');
  const [ log, setLog ] = useState(null);

  useEffect(() => {
    if (log) return;
    if (typeof document != undefined) {
      var log_ = document.getElementById('log');
    }
    setLog(log_);
  }, [messages]);

  const handleShow = () => {}

  const handleChange = (evt) => {
    // console.log('change', evt.target.value);
    setContent(evt.target.value);
  }

  const scrollToBottom = () => {
    console.log('before', log.scrollTop, log.scrollHeight, log.clientHeight)
    // var doScroll = log.scrollTop < log.scrollHeight - log.clientHeight - 1;
    // if (doScroll) {
      log.scrollTop = log.scrollHeight - log.clientHeight;
    // }
    console.log('after', log.scrollTop, log.scrollHeight, log.clientHeight)
  }

  const handleSend = async () => {
    // console.log('send!');
    document.getElementById('input').value = '';
    var newMessages = messages;
    newMessages.push({message_id: 4, username: 'sunxunxunxun', content: '手机号登录不就行了吗', from_id: 2, to_id: 2, room_id: 1, created_at: '2022-03-13'});
    setMessages(newMessages);
    scrollToBottom();
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