import Layout from "../components/layout";
import Loginer from "../components/loginer";
import { useConnect, useAccount } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { currentUser as queryCurrentUser } from "../lib/api";
import Router from "next/router";
import { useEffect, useState } from "react";

function Login() {
  return (
    <>
      <Layout>
        <h1>Login</h1>
        <Loginer />
      </Layout>
    </>
  );
}

export default Login;
