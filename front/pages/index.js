import Layout from '../components/layout'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter();
  const handleClick = () => {
    router.push('./login');
  }

  return (
    <>
      <Layout>
        <h1>Home</h1>
        <button onClick={handleClick}>Run App</button>
      </Layout>
    </>
  )
}
