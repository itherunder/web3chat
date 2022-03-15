import { Avatar, List, Input, Grid, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './chat.module.css'
import { sendMessage } from '../lib/api'

const Item = List.Item
const { Search } = Input;

// show message when error
const error_message = {message_id: -1, username: 'ERROR', content: 'Your browser does not support WebSockets.', from_id: -1, to_id: -1, room_id: -1, created_at: 'error'};
const close_message = {message_id: -1, username: 'CLOSE', content: 'Connection closed.', from_id: -1, to_id: -1, room_id: -1, created_at: 'close'};

const Chat = ({ messages, setMessages, user, room, token, queryOnlineNumber }) => {
  const [ showExtra, setShowExtra ] = useState(false);
  const [ content, setContent ] = useState('');
  const [ conn, setConn ] = useState(null);
  const [ log, setLog ] = useState(null);

  const appendMessage = (message) => {
    var newMessages = messages;
    newMessages.push(message);
    setMessages(newMessages);
  }

  useEffect(() => {
    console.log('conn ', conn);
    if (!conn) return;
    conn.onopen = (evt) => {
      // console.log('ws conn onopen', conn);
      // get online users number
      queryOnlineNumber();
    };
    conn.onclose = (evt) => {
      // console.log('ws conn onclose', conn);
      appendMessage(close_message);
    };
    conn.onmessage = (evt) => {
      // console.log(evt);
      // update number
      queryOnlineNumber();
      var msgs = evt.data.split('\n');
      console.log('msgs ', msgs);
      // console.log('ws conn onmessage', conn, msgs);
      for (var i = 0; i < msgs.length; i++) {
        var msg = JSON.parse(msgs[i]);
        // donot receive self message
        if (msg.user.user_id == user.user_id) continue;
        var message = msg.message;
        message.username = msg.user.username;
        appendMessage(message);
        document.getElementById('input').value = content;
      }
    };
  }, [conn]);

  useEffect(() => {
    if (!room || !user || !token) return;
    if (typeof document != undefined) {
      var log_ = document.getElementById('log');
    }
    setLog(log_);
    console.log('room token', room, token);
    if (typeof window != undefined) {
      if (window['WebSocket']) {
        const conn_ = new WebSocket(
          'ws://' +
            process.env.NEXT_PUBLIC_WS_PROXY +
            '/ws?roomName=' +
            room.room_name +
            '&token=Bearer ' +
            token,
        );
        setConn(conn_);
      } else {
        // error
        setMessages([error_message]);
      }
    }
  }, [messages]);

  const handleShow = () => {}

  const handleChange = (evt) => {
    // console.log('change', evt.target.value);
    setContent(evt.target.value);
  }

  const scrollToBottom = () => {
    // var doScroll = log.scrollTop < log.scrollHeight - log.clientHeight - 1;
    // if (doScroll) {
      log.scrollTop = log.scrollHeight - log.clientHeight;
    // }
  }

  const handleSend = async () => {
    // console.log('send!');
    if (content == '') {
      alert('content is null');
      return;
    }
    document.getElementById('input').value = '';
    console.log('user ', user);
    var message = JSON.stringify({
      address: user.address,
      room_id: room.room_id.toString(),
      content: content,
    });
    var res = await sendMessage(message, token);
    if (res.status.status != 'ok') {
      alert('send message error!');
      return;
    }
    message = res.data.message;
    message.username = res.data.user.username;
    
    if (!conn) {
      alert('conn is null');
      return;
    }
    let msg = { message: res.data.message, user: user, msg_type: 1 };
    console.log(msg);
    conn.send(JSON.stringify(msg));
    
    appendMessage(message);
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
              <span className={styles.time}>{item.created_at}</span>
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
        <button type="primary" onClick={setMessages([])}>Clear</button>
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