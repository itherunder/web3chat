import styles from "./index.less"
import { useParams, useModel } from "umi";
import { useEffect, useState } from "react";
import { currentRoom as queryCurrentRoom, sendMessage } from "@/services/web3chat/api";

const Chat = () => {
  const [ roomName, setRoomName ] = useState(useParams()['roomName']);
  const [ roomStatus, setRoomStatus ] = useState(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [ messages, setMessages ] = useState([]);
  const conn = null;
  const msg = document.getElementById("msg");
  const log = document.getElementById("log");

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
    queryRoom();
  }, [roomName]);

  useEffect(() => {
    console.log('debug messages: ', messages);
    if (messages == null) return;
    for (var i = messages.length-1; i > -1; i--) {
      var item = document.createElement("div");
      item.innerHTML = messages[i].FromId + ': ' + messages[i].Content + ' ' + messages[i].CreatedAt;
      appendLog(item);
    }
  }, [messages]);

  const handleClick = async () => {
    var msg = document.getElementById('msg').value;
    if (msg == '') {
      return;
    }
    let response = await sendMessage(JSON.stringify({address: initialState?.currentUser?.Address, roomId: roomStatus?.room_id.toString(), content: msg}));
    if (response.data.status != 'ok') {
      alert('send message error:', response.data.extra_msg);
      return;
    }
    setMessages([response.message]);
    if (!conn) {
      return false;
    }
    if (!msg.value) {
      return false;
    }
    conn.send(msg.value);
    msg.value = "";
    return false;
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
