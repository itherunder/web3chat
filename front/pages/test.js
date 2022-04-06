import { useEffect, useState } from "react";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import Layout from "../components/layout";
import Header from "../components/header";
import { currentUser as queryCurrentUser } from "../lib/api";
import Router from "next/router";
import { Row, Col, Upload, Modal } from "antd";
import Image from "next/image";
import { checkSize, checkType } from "../lib/utils";

const Test = () => {
  const [{ data: connectData }, connect] = useConnect();
  const [{ data: account }, disconnect] = useAccount();
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewImageName, setPreviewImageName] = useState("");

  // const handleAccountChange = (evt) => {
  //   console.log('account changed: ', evt);
  // }

  // const handleChainChanged = (evt) => {
  //   console.log('chain changed: ', evt);
  // }

  // const handleConnect = (evt) => {
  //   console.log('account connect: ', evt);
  // }

  // useEffect(() => {
  //   connector.on('connect', handleConnect)
  //   console.log(connector);
  // }, [account]);

  // const connectWallet = () => {
  //   connect(connector);
  // }
  const showPreview = file => {
    if (file.name) setPreview(true);
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewImageName(file.name);
  };

  const hidePreview = () => {
    setPreview(false);
  };

  const handleImgChange = file => {};

  const checkImage = async file => {
    var res = await checkType(file, ["image/png", "image/jpeg"]);
    if (!res) return false;
    res = await checkSize(file, 10);
    return res;
  };

  return (
    <>
      <Layout>
        <Row justify="space-around">
          <Col span={16}>
            <Upload
              listType="picture"
              action={process.env.NEXT_PUBLIC_PROXY + "/upload"}
              beforeUpload={checkImage}
              onPreview={showPreview}
              onChange={handleImgChange}
            >
              <button>上传图片</button>
            </Upload>
            {/* <button type='primary' onClick={}>Add Picture</button> */}
          </Col>
          <Modal visible={preview} footer={null} onCancel={hidePreview}>
            <Image src={previewImage} alt={previewImageName} style={{ width: "40%" }} />
          </Modal>
          <Col span={16}>
            <button type="primary">Add File</button>
          </Col>
        </Row>
        {/* <Header {...{ showHeader: true, setCurrentUser, setToken }} /> */}
        {/* <h1>Test</h1>
        {connectData.connected ? <p>{account?.address}</p> : <div>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>}
        {connectData.connected ? <button onClick={disconnect}>Disconnect</button> : null} */}
      </Layout>
    </>
  );
};

export default Test;
