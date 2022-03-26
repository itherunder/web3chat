import { Avatar, List, Input, Divider, Row, Col, Upload, Modal, Form, Card } from 'antd';
import { useEffect, useState } from 'react';
import styles from './chat.module.css'
import { sendMessage } from '../lib/api'
import Image from 'next/image'
import { checkSize, checkType } from '../lib/utils';
import RedPacket from './redPacket';
import RedPacketItem from './redPacketItem';

const Item = List.Item
const { Search, TextArea } = Input;
const { Meta } = Card;

// show message when error
const error_message = {message_id: -1, username: 'ERROR', content: 'Your browser does not support WebSockets.', from_id: -1, to_id: -1, room_id: -1, created_at: 'error'};
const close_message = {message_id: -1, username: 'CLOSE', content: 'Connection closed.', from_id: -1, to_id: -1, room_id: -1, created_at: 'close'};

const Chat = ({ messages, setMessages, user, room, token, queryOnlineNumber, handleJoin }) => {
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

  // TODO: send a LOGIN message when online
  // and a LOGOUT message when logout
  useEffect(() => {
    if (!conn) return;
    // queryOnlineNumber();
    conn.onopen = (evt) => {
      console.log('ws conn onopen', conn);
      queryOnlineNumber();
    };
    conn.onclose = (evt) => {
      console.log('websocket closed: ' + evt.code + ' ' + evt.reason + ' ' + evt.wasClean);
      console.log('ws conn onclose', conn);
      queryOnlineNumber();
      appendMessage(close_message);
    };
    conn.onmessage = (evt) => {
      console.log('ws conn onmessage', conn, evt);
      // update number
      queryOnlineNumber();
      var msgs = evt.data.split('\n');
      console.log('onmessage msgs ', msgs);
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

  useEffect(() => {
    if (!chat) return;
    scrollToBottom();
  }, [messages])

  // tofix: when back to chat, this will error
  const scrollToBottom = () => {
    // var doScroll = chat.scrollTop < chat.scrollHeight - chat.clientHeight - 1;
    // if (doScroll) chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }

  const handleSend = async () => {
    // console.log('send!');
    if (content == '' && fileList.length === 0) {
      alert('content is null and is no picture');
      return;
    }
    var msgtype = 'TEXT';
    var content_ = content;
    if (fileList.length !== 0) {
      if (fileList[0].status !== 'done') {
        alert('the picture status is not done: ' + fileList[0].status);
        return;
      }
      msgtype = 'PICTURE';
      content_ = JSON.stringify({
        content: content,
        picture: fileList[0].response ? fileList[0].response.data : 'error',
      });
    }
    // console.log('user ', user);
    var message = JSON.stringify({
      address: user.address,
      room_id: room.room_id.toString(),
      content: content_,
      message_type: msgtype,
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
    let msg = { message: res.data.message, user: user, message_type: msgtype };
    console.log('msg', msg);
    conn.send(JSON.stringify(msg));

    appendMessage(message);
    document.getElementById('input').value = '';
    setFileList([]);
    setContent('');
  }

  const handleImgChange = ({ file }) => {
    // status: 'done', 'removed', 'error', 'uploading'
    console.log('file status: ', file.status);
    if (file.status === 'done' || file.status === 'uploading') {
      setFileList([file]);
      console.log('upload file res: ', file.response, file);
    } else if (file.status === 'error') {
      alert('upload file error: ' + file.status);
      setFileList([]);
    } else if (file.status === 'removed') {
      // TODO: delete file on backend
      setFileList([]);
    }
  }
  
  const checkImage = async (file) => {
    var res = checkType(file, ['image/png', 'image/jpeg', 'image/gif']) && checkSize(file, 10);
    return res || Upload.LIST_IGNORE;
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
                    ) : (
                      item.message_type === 'PICTURE' ? (
                        <Card
                          bordered={true}
                          style={{ width: '80%', background: '#FBFBEA' }}
                          cover={<img alt="picture" src={process.env.NEXT_PUBLIC_PROXY + "/uploads/" + JSON.parse(item.content).picture} />}
                        >
                          <Meta
                            avatar={<Avatar src={"https://joeschmoe.io/api/v1/" + item.from_id.toString()} />}
                            description={JSON.parse(item.content).content}
                          />
                        </Card>
                      ) : (
                        item.message_type === 'JOIN' ? (
                          <button type='primary' onClick={handleJoin}>
                            <h1>Join Room Now!</h1>
                          </button>
                        ) : (<p style={{ "whiteSpace": "pre-line" }}>{item.content}</p>)
                      )
                    )
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
        room ? (
          <div>
            {/* <Input
              allowClear={true}
              placeholder='text here'
              onChange={handleChange}
            /> */}
            <textarea id='input' placeholder='text here' style={{ width: '100%' }} onChange={handleChange} />
            <button type="primary" style={{ width: '80%' }} onClick={() => handleSend()}>Send</button>
            <button type='primary' style={{ width: '20%' }} onClick={handleExtra}>+</button>
            {
              showExtra?(
                <div>
                  <Divider orientation="left"></Divider>
                  <Row justify="space-around">
                    <Col span={8}>
                      <Upload
                        listType={fileList[0] ? 'picture' : 'text'}
                        action={process.env.NEXT_PUBLIC_PROXY + '/api/user/upload'}
                        fileList={fileList}
                        beforeUpload={checkImage}
                        onChange={handleImgChange}
                        headers={{
                          Authorization: 'Bearer ' + token,
                        }}
                      >
                        {fileList.length === 0?<button>upload picture</button>:null}
                      </Upload>
                    </Col>
                    {
                      fileList.length === 0?(
                        <Col span={8}>
                          <button type='primary' onClick={handleRedPacket}>send redpacket</button>
                        </Col>
                      ):null
                    }
                  </Row>
                </div>
              ):null
            }
          </div>) : null
      }
      <RedPacket {...{showRedPacket, setShowRedPacket, appendMessage, conn, user, room, token}} />
    </>
  )
}

export default Chat;
