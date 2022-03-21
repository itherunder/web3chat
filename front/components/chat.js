import { Avatar, List, Input, Divider, Row, Col, Upload, Modal, Form, Card } from 'antd';
import { useEffect, useState } from 'react';
import styles from './chat.module.css'
import { sendMessage } from '../lib/api'
import Image from 'next/image'
import { checkSize, checkType } from '../lib/utils';
import RedPacket from './redPacket';
import RedPacketItem from './redPacketItem';

const Item = List.Item
const { Search } = Input;

// show message when error
const error_message = {message_id: -1, username: 'ERROR', content: 'Your browser does not support WebSockets.', from_id: -1, to_id: -1, room_id: -1, created_at: 'error'};
const close_message = {message_id: -1, username: 'CLOSE', content: 'Connection closed.', from_id: -1, to_id: -1, room_id: -1, created_at: 'close'};

const Chat = ({ messages, setMessages, user, room, token, queryOnlineNumber }) => {
  const [ showExtra, setShowExtra ] = useState(false);
  const [ content, setContent ] = useState('');
  const [ conn, setConn ] = useState(null);
  const [ chat, setChat ] = useState(null);
  const [ fileList, setFileList ] = useState([]);
  const [ showRedPacket, setShowRedPacket ] = useState(false);

  const appendMessage = (message) => {
    var newMessages = messages.slice();
    newMessages.push(message);
    setMessages(newMessages);
  }

  useEffect(() => {
    if (!conn) return;
    conn.onopen = (evt) => {
      console.log('ws conn onopen', conn);
      queryOnlineNumber();
    };
    conn.onclose = (evt) => {
      console.log('ws conn onclose', conn);
      appendMessage(close_message);
    };
    conn.onmessage = (evt) => {
      console.log('ws conn onmessage', conn, evt);
      // update number
      queryOnlineNumber();
      var msgs = evt.data.split('\n');
      console.log('msgs ', msgs);
      // console.log('ws conn onmessage', conn, msgs);
      for (var i = 0; i < msgs.length; i++) {
        var msg = JSON.parse(msgs[i]);
        // ignore self message
        if (msg.user.user_id == user.user_id) continue;
        var message = msg.message;
        message.username = msg.user.username;
        appendMessage(message);
      }
    };
  }, [conn]);

  useEffect(() => {
    if (!room || !user || !token) return;
    if (typeof document != undefined) {
      var chat_ = document.getElementById('chat');
    }
    setChat(chat_);
    // console.log('room', room, 'token', token);
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
  }, [room, user, token]);

  // const handleShow = () => {}

  const handleChange = (evt) => {
    // console.log('change', evt.target.value);
    setContent(evt.target.value);
  }

  // const scrollToBottom = () => {
  //   // var doScroll = chat.scrollTop < chat.scrollHeight - chat.clientHeight - 1;
  //   // if (doScroll) {
  //     chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  //   // }
  // }

  const handleSend = async () => {
    // console.log('send!');
    if (content == '') {
      alert('content is null');
      return;
    }
    // console.log('user ', user);
    var message = JSON.stringify({
      address: user.address,
      room_id: room.room_id.toString(),
      content: content,
      message_type: 'TEXT',
    });
    var res = await sendMessage(message, token);
    if (res.status.status != 'ok') {
      alert('send message error!');
      return;
    }
    message = res.data.message;
    message.username = res.data.user.username;
    
    if (!conn) {
      alert('conn is null, please refresh to reconnect.');
      return;
    }
    let msg = { message: res.data.message, user: user, message_type: 'TEXT' };
    console.log('msg', msg);
    conn.send(JSON.stringify(msg));
    
    appendMessage(message);
    // scrollToBottom();
    document.getElementById('input').value = '';
    setContent('');
  }

  const handleImgChange = ({ file }) => {
    if (file.status === 'removed') {
      setFileList([]);
    } else {
      setFileList([file]);
    }
  }
  
  const checkImage = async (file) => {
    var res = await checkType(file, ['image/png', 'image/jpeg', 'image/gif']);
    if (!res) return false;
    res = await checkSize(file, 10);
    return res;
  }

  const handleExtra = () => {
    setShowExtra(!showExtra);
  }

  const handleRedPacket = () => {
    setShowRedPacket(true);
  }

  return (
    <>
      <div id='chat' className={styles.chat}>
        {
          messages?(
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={item => (
              <Item>
                <Item.Meta
                  avatar={<Avatar size="small" src={"https://joeschmoe.io/api/v1/" + String(item.from_id)} />}
                  title={<a href={"/u/" + item.username}>{item.username}</a>}
                  description={
                    item.message_type === 'REDPACKET' ? (
                      <RedPacketItem {...{item, user, token}}/>
                    ) : item.content
                    // item => {
                    //   switch(item.message_type) {
                    //     case 'TEXT':
                    //       return (item.content);
                    //     case 'REDPACKET':
                    //       return <RedPacketItem {...{item, user, token}}/>
                    //     case 'CLOSE':
                    //       return <b>item.content</b>
                    //     default:
                    //       return item.content;
                    //   }
                    // }
                  }
                />
                <span className={styles.time}>{item.created_at.substr(0,10) + ' '+ item.created_at.substr(11,8)}</span>
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
        <button type="primary" onClick={() => handleSend()}>Send</button>
        <button type='primary' onClick={handleExtra}>+</button>
        {
          showExtra?(
            <div>
              <Divider orientation="left"></Divider>
              <Row justify="space-around">
                <Col span={8}>
                  <Upload
                    listType='picture-card'
                    // action={process.env.NEXT_PUBLIC_PROXY + '/upload'}
                    fileList={fileList}
                    beforeUpload={checkImage}
                    onChange={handleImgChange}
                  >
                    {fileList.length === 0?<button>上传图片</button>:null}
                  </Upload>
                </Col>
                {
                  fileList.length === 0?(
                    <Col span={8}>
                      <button type='primary' onClick={handleRedPacket}>发送红包</button>
                    </Col>
                  ):null
                }
              </Row>
            </div>
          ):null
        }
      </div>
    }
      <RedPacket {...{showRedPacket, setShowRedPacket, appendMessage, conn, user, room, token}} />
    </>
  )
}

export default Chat;