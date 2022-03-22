
import Header from "../../components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const User = () => {
  const router = useRouter();
  const [ currentUser, setCurrentUser ] = useState(null);
  const [ token, setToken ] = useState('');
  const [ username, setUsername ] = useState('');
  
  useEffect(() => {
    if (!router.isReady) return;
    setUsername(router.query.username);
  }, [router.isReady]);

  useEffect(() => {
    if (!currentUser) return;
    if (router.query.username == currentUser.username) {
      router.push('/profile');
    }
  }, [currentUser])

  return (
    <Header {...{showHeader: true, setCurrentUser, setToken}}/>
  )
}