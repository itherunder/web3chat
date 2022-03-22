
import Header from "../../components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import UserProfile from "../../components/userProfile";
import { queryProfile as queryUserProfile } from "../../lib/api";

const User = () => {
  const router = useRouter();
  const [ currentUser, setCurrentUser ] = useState(null);
  const [ token, setToken ] = useState('');
  const [ username, setUsername ] = useState('');
  const [ user, setUser ] = useState(null);
  const [ rooms, setRooms ] = useState(null);
  
  useEffect(() => {
    if (!router.isReady) return;
    setUsername(router.query.username);
  }, [router.isReady]);

  useEffect(() => {
    if (!currentUser) return;
    if (router.query.username == currentUser.username) {
      router.push('/profile');
    }
  }, [currentUser]);

  useEffect(() => {
    if (username === '' || token === '') return;
    queryProfile();
  }, [username, token])

  const queryProfile = async () => {
    var res = await queryUserProfile(JSON.stringify({
      username: username,
    }), token);
    if (res.status.status !== 'ok') {
      alert('query profile error');
      return;
    }
    setUser(res.data.user);
  }

  return (
    <Layout>
      <Header {...{showHeader: true, setCurrentUser, setToken, setRooms}}/>
      <h1>{username + "'s profile"}</h1>
      <UserProfile {...{ user }}/>
    </Layout>
  )
}

export default User;
