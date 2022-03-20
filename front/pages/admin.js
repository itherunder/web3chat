import { useContract } from "wagmi";
import { ContractFactory, ethers  } from "ethers";
import redPacketAbi from '../contracts/abi/redpacket.json'
import bytecode from '../contracts/bytecode/redpacket.json'
import Layout from "../components/layout";
import { useEffect, useState } from "react";
import Header from "../components/header";
import { Web3Provider } from "@ethersproject/providers";

const Admin = () => {
  const [ redPacketAddr, setRedPacketAddr ] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [ currentUser, setCurrentUser ] = useState(null);
  const [ token, setToken ] = useState(null);
  const [ signer, setSigner ] = useState(null);
  const [ loading, setLoading ] = useState(false);

  const deployRedPacket = async () => {
    if (!signer) {
      alert('need a signer, connect the wallet and try again');
      return;
    }
    const factory = new ContractFactory(redPacketAbi, bytecode.deployBytecode, signer=signer);
    setLoading(true);
    try {
      const contract = await factory.deploy();
    } catch (err) {
      alert('error when deploy contract: ' + err.message);
      setLoading(false);
      return;
    }
    setRedPacketAddr(contract.address);
  }

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.user_type !== "admin") {
      alert('you are not allowed to this page');
    }
    const provider = new Web3Provider(window.ethereum);
    setSigner(provider.getSigner());
  }, currentUser)

  return (
    <Layout>
      <Header {...{showHeader: true, setCurrentUser, setToken}}></Header>
      <h1>Admin</h1>
      {
        (redPacketAddr == '')?(
          <button type="primary" onClick={deployRedPacket}>
            {loading?"loading":"deploy red packet"}
          </button>
        ):null
      }
      <br/>
      <button type="primary">refund red packet</button>
      <h1>Addr: {redPacketAddr}</h1>
    </Layout>
  )
  
}

export default Admin;
