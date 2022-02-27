import styles from "./index.less"
import { useParams, useModel } from "umi";
import { useEffect, useState } from "react";
import { currentRoom as queryCurrentRoom } from "@/services/web3chat/api";

const Chat = () => {
  const [ roomName, setRoomName ] = useState(useParams()['roomName']);
  const [ roomStatus, setRoomStatus ] = useState(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  
  useEffect(() => {
    let response = queryCurrentRoom({roomName: roomName});
    if (response.data.status != 'ok') {
      setRoomStatus(null);
      alert('undefined room');
    } else {
      setRoomStatus(response.room);
    }
  }, [roomName]);

  const handleClick = function () {
    var msg = document.getElementById('msg');
    // initialState?.currentUser?.UserId
    
    console.log('click send');
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
        <div className={styles.log}></div>
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
