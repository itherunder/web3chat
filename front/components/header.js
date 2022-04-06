/* eslint-disable react-hooks/exhaustive-deps */
// login status component
import { Avatar, Affix } from "antd";
import { useEffect, useState } from "react";
import { useConnect, useAccount, useSignMessage, useFeeData } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { currentUser as queryCurrentUser } from "../lib/api";
import { useRouter } from "next/router";

const Header = ({ showHeader, setCurrentUser, setToken, setRooms }) => {
  const [showExtra, setShowExtra] = useState(false);
  const [{ data: connectData, error: connectError, loading: connectLoading }, connect] = useConnect();
  const [{ data: account }, disconnect] = useAccount();
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.rooms === "") {
      setRooms({});
      return;
    }
    setRooms(JSON.parse(user.rooms));
  }, [user]);

  const getInitialState = async token_ => {
    let res = await queryCurrentUser(token_);
    if (res.status.status != "ok") {
      router.push("/login");
      return;
    }
    if (res.data.address.toLowerCase() != account?.address.toLowerCase()) {
      disconnect();
      alert("please change your wallet to " + res.data.address);
      return;
    }
    var user_ = res.data;
    user_.user_type = res.status.user_type;
    setCurrentUser(user_);
    setUser(user_);
    setToken(token_);
  };

  const handleShowExtra = () => {
    setShowExtra(!showExtra);
  };

  const handleLogout = () => {
    if (!user) {
      alert("current user is null");
      router.push("/login");
      return;
    }
    if (typeof window != undefined) {
      // clear jwt token
      window.localStorage.setItem("token", "");
      alert("loged out!");
      router.push("/login");
    } else {
      alert("logout failed, please try again!");
    }
  };

  const handleProfile = () => {
    // console.log('current user: ', user);
    router.push("/profile");
  };

  useEffect(() => {
    // console.log('connected', connectData, 'account', account);
    if (!connectData.connected && !account) {
      connectWallet();
      return;
    }
    if (typeof window != undefined) {
      var token_ = window.localStorage.getItem("token");
    }
    getInitialState(token_);
  }, [connectData.connected]);

  const connectWallet = () => {
    connect(new InjectedConnector());
  };

  return showHeader ? (
    <div>
      {connectData.connected ? null : (
        <div>
          <button type="primary" onClick={connectWallet}>
            {connectLoading ? "loading" : "Connect Wallet"}
          </button>
        </div>
      )}
      {/* <div id='profile' onMouseMove={setShowExtra(true)} onMouseOut={setShowExtra(false)}> */}
      <div id="profile" onClick={handleShowExtra}>
        <Avatar size="small" src={"https://joeschmoe.io/api/v1/" + String(user?.user_id || "random")} />
        <span>{user?.username} </span>
        <button type="primary">settings</button>
        {showExtra ? (
          <div>
            <button id="logout" onClick={handleLogout}>
              log out
            </button>
            <button id="profile" onClick={handleProfile}>
              profile
            </button>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default Header;
