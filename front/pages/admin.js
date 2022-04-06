import { useContract } from "wagmi";
import { Contract, ContractFactory } from "ethers";
import redPacketABI from "../contracts/abi/redpacket.json";
import bytecode from "../contracts/bytecode/redpacket.json";
import Layout from "../components/layout";
import { useEffect, useState } from "react";
import Header from "../components/header";
import { Web3Provider } from "@ethersproject/providers";
import { Form, Input, Modal } from "antd";
import Router from "next/router";

const Admin = () => {
  const [redPacketAddr, setRedPacketAddr] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [redPacketContract, setRedPacketContract] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    console.log(currentUser);
    if (currentUser.user_type != "admin") {
      alert("you are not allowed to this page");
      Router.push("/search");
    }
    const provider = new Web3Provider(window.ethereum);
    setSigner(provider.getSigner());
  }, [currentUser]);

  useEffect(() => {
    if (redPacketAddr === "" || !signer) return;
    if (redPacketContract) return;
    setRedPacketContract(new Contract(redPacketAddr, redPacketABI, signer));
  }, [redPacketAddr, redPacketContract, signer]);

  const deployRedPacket = async () => {
    if (!signer) {
      alert("need a signer, connect the wallet and try again");
      return;
    }
    const factory = new ContractFactory(redPacketABI, bytecode.deployBytecode, (signer = signer));
    setLoading(true);
    var contract = null;
    try {
      contract = await factory.deploy();
    } catch (err) {
      alert("error when deploy contract: " + err.message);
      setLoading(false);
      return;
    }
    setRedPacketAddr(contract?.address);
    setRedPacketContract(contract);
  };

  const refundRedPacket = async () => {
    setShowRefund(true);
  };

  const handleRefund = async () => {
    if (!signer || !redPacketContract) {
      alert("no signer or red packet contract");
      return;
    }
    const values = form.getFieldsValue();
    setRefundLoading(true);
    var receipt = null;
    try {
      receipt = await redPacketContract.refundPacket(values.addr, values.index);
    } catch (err) {
      alert("refund error: " + err.message);
    }
    setRefundLoading(false);
    setShowRefund(false);
  };

  const handleCancel = () => {
    setShowRefund(false);
  };

  return (
    <Layout>
      <Header {...{ showHeader: true, setCurrentUser, setToken, setRooms }}></Header>
      <h1>Admin</h1>
      {redPacketAddr == "" ? (
        <button type="primary" onClick={deployRedPacket}>
          {loading ? "loading" : "deploy red packet"}
        </button>
      ) : null}
      <br />
      <button type="primary" onClick={refundRedPacket}>
        refund red packet
      </button>
      <h1>Addr: {redPacketAddr === "" ? "" : redPacketAddr.substr(0, 4) + "..." + redPacketAddr.substr(-2, 2)}</h1>
      <Modal
        visible={showRefund}
        title="refund red packet"
        destroyOnClose={true}
        onOk={handleRefund}
        onCancel={handleCancel}
      >
        {refundLoading ? (
          "loading"
        ) : (
          <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="Address" name="addr" required={true}>
              <Input placeholder="packet owner's address" />
            </Form.Item>
            <Form.Item label="Index" name="index" required={true}>
              <Input placeholder="packet index" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Layout>
  );
};

export default Admin;
