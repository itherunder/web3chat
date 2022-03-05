import styles from './index.less';
import { useParams, useModel } from 'umi';
import { useEffect, useState } from 'react';
import { currentRoom as queryCurrentRoom, sendMessage, countOnline } from '@/services/web3chat/api';

const Chat = () => {
  const [roomName, setRoomName] = useState(useParams()['roomName']);
  const [roomStatus, setRoomStatus] = useState(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [messages, setMessages] = useState([]);
  const [conn, setConn] = useState(null);
  const [onlineNum, setOnlineNum] = useState(0);
  let msg = document.getElementById('msg');
  let log = document.getElementById('log');

  const appendLog = (item) => {
    var doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
    log.appendChild(item);
    if (doScroll) {
      log.scrollTop = log.scrollHeight - log.clientHeight;
    }
  };

  const queryRoom = async () => {
    console.log('debug queryRoom');
    let res = await queryCurrentRoom({ roomName: roomName });
    if (res.data.status != 'ok') {
      setRoomStatus(null);
      alert('undefined room');
      // back to search page
      history.push('/room/search');
    } else {
      setRoomStatus(res.room);
      setMessages(res.messages);
    }
  };

  const queryOnlineNumber = async () => {
    let res = await countOnline({ roomName: roomName });
    if (res.data.status == 'ok') {
      setOnlineNum(res.count);
    }
  };

  useEffect(() => {
    if (!conn) return;
    conn.onopen = (evt) => {
      console.log('ws conn onopen', conn);
      // get online users number
      queryOnlineNumber();
    };
    conn.onclose = (evt) => {
      console.log('ws conn onclose', conn);
      var item = document.createElement('div');
      item.innerHTML = '<b>Connection closed.</b>';
      appendLog(item);
    };
    conn.onmessage = (evt) => {
      // update number
      queryOnlineNumber();
      var _messages = evt.data.split('\n');
      console.log('ws conn onmessage', conn, _messages);
      for (var i = 0; i < _messages.length; i++) {
        var item = document.createElement('div');
        var _message = JSON.parse(_messages[i]);
        item.innerHTML = _message.from_id + ': ' + _message.content + ' ' + _message.created_at;
        appendLog(item);
      }
    };
  }, [conn]);

  useEffect(() => {
    queryRoom();
    if (window['WebSocket']) {
      const conn_ = new WebSocket(
        'ws://localhost:8080/ws?roomName=' +
          roomName +
          '&token=Bearer ' +
          window.localStorage.getItem('token'),
      );
      setConn(conn_);
    } else {
      var item = document.createElement('div');
      item.innerHTML = '<b>Your browser does not support WebSockets.</b>';
      appendLog(item);
    }
  }, [roomName]);

  useEffect(() => {
    console.log('messages changed: ', messages);
    if (messages == null) return;
    for (var i = messages.length - 1; i > -1; i--) {
      var item = document.createElement('div');
      item.innerHTML =
        messages[i].username + ': ' + messages[i].content + ' ' + messages[i].created_at;
      appendLog(item);
    }
  }, [messages]);

  const handleClick = async () => {
    if (msg.value == '') {
      return;
    }
    let message_json = JSON.stringify({
      address: initialState?.currentUser?.address,
      room_id: roomStatus?.room_id.toString(),
      content: msg.value,
    });
    console.log('send message');
    let res = await sendMessage(message_json);
    if (res.data.status != 'ok') {
      alert('send message error:', res.data.extra_msg);
      return;
    }
    // setMessages([res.message]);
    if (!conn || !msg.value) {
      console.log('error conn is null', conn, msg.value);
      return false;
    }
    conn.send(JSON.stringify(res.message));
    msg.value = '';
  };

  return (
    <div>
      <h1>Chat in `{roomName}`</h1>
      <div id="log" className={styles.log}></div>
      <div className={styles.box}>
        <button onClick={() => handleClick()}>Send</button>
        <input type="text" id="msg" size="64" autoFocus />
        <b>online users number: {onlineNum}</b>
      </div>
    </div>
  );
};

export default Chat;
