import { Router, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import { currentRoom as queryCurrentRoom, currentUser, currentUser as queryCurrentUser } from '../../lib/api'
import Chat from '../../components/chat'

const Room = () => {
  const router = useRouter();
  const [ currentRoom, setCurrentRoom ] = useState(null);
  const [ roomName, setRoomName ] = useState(null);
  const [ messages, setMessages ] = useState(null);
  const [ token, setToken ] = useState(null);

  const getInitialState = async () => {
    if (!roomName) return;
    var res = await queryCurrentUser(token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    res = await queryCurrentRoom({ roomName }, token);
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
        <h1>Room: {roomName}</h1>
        <button onClick={() => {setMessages([]);}}>Clear Messages</button>
        <Chat messages={messages} user={currentUser} />
      </Layout>
    </>
  )
}

export default Room
