import { Router, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import { currentRoom as queryCurrentRoom, countOnline } from '../../lib/api'
import Chat from '../../components/chat'
import Header from '../../components/header'

const Room = () => {
  const router = useRouter();
  const [ currentRoom, setCurrentRoom ] = useState(null);
  const [ currentUser, setCurrentUser ] = useState(null);
  const [ roomName, setRoomName ] = useState(null);
  const [ messages, setMessages ] = useState(null);
  const [ token, setToken ] = useState(null);
  const [ onlineNum, setOnlineNum ] = useState(0);
  const [ rooms, setRooms ] = useState(null);

  const queryOnlineNumber = async () => {
    let res = await countOnline({ roomName: roomName }, token);
    if (res.status.status == 'ok') {
      setOnlineNum(res.data);
    }
  };

  const getInitialState = async () => {
    if (!roomName || !token || !rooms) return;
    if (!rooms.hasOwnProperty(roomName)) {
      alert('you have to join this room first');
      setMessages([{
        message_type: 'JOIN',
        username: currentUser?.username || 'JOIN',
        from_id: currentUser?.user_id || 0,
        created_at: '1990-01-01 00:00:00',
      }])
      return;
    }
    var res = await queryCurrentRoom({ roomName }, token);
    if (res.status.status != 'ok') {
      alert('room error, back to search');
      router.push('/search');
      return;
    }
    setCurrentRoom(res.data.room);
    setMessages(res.data.messages?.reverse() || []);
    console.log('messages', res.data.messages);
  }

  useEffect(() => {
    if (!router.isReady) return;
    setRoomName(router.query.roomName);
  }, [router.isReady]);

  useEffect(() => {
    getInitialState();
  }, [roomName, token, rooms]);

  return (
    <>
      <Layout>
        <Header {...{showHeader: true, setCurrentUser, setToken, setRooms}}/>
        <span>Room: {roomName}</span>
        <span> online users number: {onlineNum} </span>
        <button onClick={() => {setMessages([]);}}>Clear Messages</button>
        {/* todo: first join room need to sign room's right */}
        {
          
            <Chat {...{messages, setMessages, user: currentUser, room: currentRoom, token, queryOnlineNumber}} />
          
        }
      </Layout>
    </>
  )
}

export default Room
