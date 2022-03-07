import { useRouter } from 'next/router'

const Room = () => {
  const router = useRouter()
  const { roomName } = router.query

  return <h1>Room: {roomName}</h1>
}

export default Room
