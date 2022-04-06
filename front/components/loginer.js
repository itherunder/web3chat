/* eslint-disable react-hooks/exhaustive-deps */
import { useConnect, useAccount, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getNonce, login, signup, signLogin } from "../lib/api";
import Router from "next/router";
import { useEffect, useState } from "react";

const Loginer = () => {
  const [{ data: connectData, error: connectError, loading: connectLoading }, connect] = useConnect();
  const [{ data: account }, disconnect] = useAccount();
  const [{ data: signData, error: signError, loading: signLoading }, signMessage] = useSignMessage();
  const [token, setToken] = useState("");

  const tryLogin = async (address, token_) => {
    console.log("tryLogin");
    var res = await login({ address }, token_);
    if (res && res.status.status == "ok") {
      alert("logged in.");
      Router.push("/search");
    }
  };

  useEffect(() => {
    if (!connectData.connected || !account) {
      connect(new InjectedConnector());
      return;
    }
    var token_ = window.localStorage.getItem("token");
    setToken(token_);
    tryLogin(account.address, token_);
  }, [connectData.connected]);

  const handleClick = async () => {
    await connect(new InjectedConnector());
    const address = account?.address;
    // console.log("address", address, "token", token);
    // if (token !== "") {
    //   await tryLogin(address, token);
    // }
    var res = null;
    res = await signup({ address: address });
    res = await getNonce({ address: address });
    var nonce = res.data;
    res = await signMessage({ message: `I am signing my one-time nonce: ${nonce}` });
    if (res.error) {
      alert("You need to sign the message to be able to log in.");
      return;
    }
    var signature = res.data;

    res = await signLogin(JSON.stringify({ address, signature }));
    if (res.status.status != "ok") {
      alert("sign error message.");
      return;
    }
    // save the jwt token in localStorage
    var token_ = res.data;
    setToken(token_);
    window.localStorage.setItem("token", token_);
    // log in
    res = await login({ address }, token_);
    if (res && res.status.status == "ok") {
      alert("logged in.");
      Router.push("/search");
    }
  };

  return (
    <>
      <button onClick={handleClick}>{connectLoading || signLoading ? "Loading..." : "Login with MetaMask"}</button>
    </>
  );
};

export default Loginer;
