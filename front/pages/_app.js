import '../styles/globals.css'
import 'antd/dist/antd.css'
import { Provider } from 'wagmi'

export default function MyApp({ Component, pageProps }) {
  
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  )
}
