import { Router, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import { currentRoom as queryCurrentRoom } from '../../lib/api'

const Room = () => {
  const router = useRouter();
  const { roomName } = router.query;
  const [ currentRoom, setCurrentRoom ] = useState(null);
  const [ token, setToken ] = useState(null);

  const getInitialState = async (token) => {
    if (!roomName) return;
    var res = await queryCurrentRoom({ roomName }, token);
    if (res.status.status != 'ok') {
      Router.push('/login')
      return;
    }
    setCurrentRoom(res.data);
    setToken(token);
  }

  useEffect(() => {
    var token = null;
    if (typeof window != undefined) {
      token = window.localStorage.getItem('token');
    }
    if (!currentRoom) {
      getInitialState(token);
    }
  }, [roomName]);

  return (
    <>
      <Layout>
        <h1>Room: {roomName}</h1>
        
      </Layout>
    </>
  )
}

export default Room
