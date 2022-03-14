import { Router, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import { currentRoom as queryCurrentRoom, currentUser, currentUser as queryCurrentUser, countOnline } from '../../lib/api'
import Chat from '../../components/chat'

const Room = () => {
  const router = useRouter();
  const [ currentRoom, setCurrentRoom ] = useState(null);
  const [ roomName, setRoomName ] = useState(null);
  const [ messages, setMessages ] = useState(null);
  const [ token, setToken ] = useState(null);
  const [ onlineNum, setOnlineNum ] = useState(0);

  const queryOnlineNumber = async () => {
    let res = await countOnline({ roomName: roomName });
    if (res.data.status == 'ok') {
      setOnlineNum(res.count);
    }
  };

  const getInitialState = async () => {
    if (!roomName) return;
    var res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    res = await queryCurrentRoom({ roomName }, token);
    await queryOnlineNumber();
    setCurrentRoom(res.data.room);
    setMessages(res.data.messages);
    setToken(token);
  }

  useEffect(() => {
    if (!router.isReady) return;
    setRoomName(router.query.roomName);
  }, [router.isReady]);

  useEffect(() => {
    var token_ = null;
    if (typeof window != undefined) {
      token_ = window.localStorage.getItem('token');
    }
    setToken(token_);
    getInitialState();
  }, [roomName]);

  return (
    <>
      <Layout>
        <h1>Room: {roomName} <b>online users number: {onlineNum}</b></h1>
        <button onClick={() => {setMessages([]);}}>Clear Messages</button>
        <Chat messages={messages} setMessages={setMessages} user={currentUser} room={currentRoom} token={token} queryOnlineNumber={queryOnlineNumber} />
      </Layout>
    </>
  )
}

export default Room
