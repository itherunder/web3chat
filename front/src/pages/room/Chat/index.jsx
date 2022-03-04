import styles from "./index.less"
import { useParams, useModel } from "umi";
import { useEffect, useState } from "react";
import { currentRoom as queryCurrentRoom, sendMessage } from "@/services/web3chat/api";

const Chat = () => {
  const [ roomName, setRoomName ] = useState(useParams()['roomName']);
  const [ roomStatus, setRoomStatus ] = useState(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [ messages, setMessages ] = useState([]);
  const [ conn, setConn ] = useState(null);
  let msg = document.getElementById("msg");
  let log = document.getElementById("log");

  const appendLog = (item) => {
    var doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
    log.appendChild(item);
    if (doScroll) {
      log.scrollTop = log.scrollHeight - log.clientHeight;
    }
  }

  const queryRoom = async () => {
    console.log('debug queryRoom');
    let response = await queryCurrentRoom({roomName: roomName});
    if (response.data.status != 'ok') {
      setRoomStatus(null);
      alert('undefined room');
      // back to search page
      history.push('/room/search');
    } else {
      setRoomStatus(response.room);
      setMessages(response.messages);
    }
  };

  useEffect(() => {
    if (!conn) return;
    conn.onopen = (evt) => {
      console.log('ws conn onopen', conn);
    }
    conn.onclose = (evt) => {
      console.log('ws conn onclose', conn);
      var item = document.createElement("div");
      item.innerHTML = "<b>Connection closed.</b>";
      appendLog(item);
    };
    conn.onmessage = (evt) => {
      var _messages = evt.data.split('\n');
      console.log('ws conn onmessage', conn, _messages);
      for (var i = 0; i < _messages.length; i++) {
        var item = document.createElement("div");
        var _message = JSON.parse(_messages[i]);
        item.innerHTML = _message.from_id + ': ' + _message.content + ' ' + _message.created_at;
        appendLog(item);
      }
    };
  }, [conn]);
  
  useEffect(() => {
    queryRoom();
    if (window["WebSocket"]) {
      console.log("ws://localhost:8080/ws");
      const conn_ = new WebSocket("ws://localhost:8080/ws");
      setConn(conn_);
    } else {
        var item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
        appendLog(item);
    }
  }, [roomName]);

  useEffect(() => {
    console.log('messages changed: ', messages);
    if (messages == null) return;
    for (var i = messages.length-1; i > -1; i--) {
      var item = document.createElement("div");
      item.innerHTML = messages[i].from_id + ': ' + messages[i].content + ' ' + messages[i].created_at;
      appendLog(item);
    }
  }, [messages]);

  const handleClick = async () => {
    if (msg.value == '') {
      return;
    }
    let message_json = JSON.stringify({address: initialState?.currentUser?.address, room_id: roomStatus?.room_id.toString(), content: msg.value});
    let response = await sendMessage(message_json);
    if (response.data.status != 'ok') {
      alert('send message error:', response.data.extra_msg);
      return;
    }
    // setMessages([response.message]);
    if (!conn || !msg.value) {
      console.log('error conn is null', conn, msg.value);
      return false;
    }
    conn.send(JSON.stringify(response.message));
    msg.value = '';
  };

  return (
    <div>
      <h1>Chat in `{roomName}`</h1>
      <div id='log' className={styles.log}></div>
      <div className={styles.form}>
        <button onClick={() => handleClick()}>
          Send
        </button>
        <input type="text" id="msg" size="64" autoFocus />
      </div>
    </div>
  )
}

export default Chat;
