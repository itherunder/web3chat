
import { Modal, Form, Select, Option, Input, InputNumber } from 'antd';
import { useState, useEffect } from 'react';
import { useBalance, useTransaction, useContract  } from 'wagmi';
import { Contract, ContractFactory, ethers  } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import redPacketABI from '../contracts/abi/redpacket.json';
import { sendMessage } from '../lib/api'

const RedPacket = ({ showRedPacket, setShowRedPacket, appendMessage, conn, user, room, token }) => {
  const [ form ] = Form.useForm();
  const [ sent, setSent ] = useState(false);
  const [ redPacketAddr, setRedPacketAddr ] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [ redPacketContract, setRedPacketContract ] = useState(null);
  const [ signer, setSigner ] = useState(null);

  // todo: support these tokens' red packet
  const tokenAddr = { // Polygon Token Address
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  }
  const initialValues = {
    token: 'ETH',
    amount: 2,
    value: 0.05,
  }

  useEffect(() => {
    const provider = new Web3Provider(window.ethereum);
    // console.log('signer ', provider.getSigner());
    setSigner(provider.getSigner());
  }, [user])

  useEffect(() => {
    if (redPacketAddr === '' || !signer) return;
    if (redPacketContract) return;
    setRedPacketContract(new Contract(redPacketAddr, redPacketABI, signer));
  }, [redPacketAddr, signer])

  const handleSendRedPacket = async () => {
    if (!conn) {
      alert('websocket is not set, refresh page please');
      return;
    }
    if (!signer) {
      alert('please connect your wallet');
      return;
    }
    if (!redPacketContract) {
      alert('red packet contract is not right, please connect the administrator');
      return;
    }
    var values = form.getFieldsValue();
    if (!values.amount || values.amount < 1 || values.amount % 1 != 0) {
      alert('amount least 1 and integer');
      return;
    }
    if (!values.value || values.value < 0.05) {
      alert('value at least 0.05 matic');
      return;
    }
    var receipt = null;
    try {
      var tx = await redPacketContract.sendPacket(values.amount, {
        value: ethers.utils.parseEther(String(values.value)),
      });
      receipt = await tx.wait();
      // tx.wait().then((receipt) => {
      //   if (receipt.events.length > 0) {
      //     setSent(true);
      //   }
      // });
      console.log('receipt: ', receipt);
    } catch (err) {
      alert('send red packet error: ' + err.message);
      return;
    }
    if (receipt.events.length > 0) {
      const event = receipt.events.find(e => e.event == 'SendRedPacket');
      console.log('send red packet event: ', event.args);
      const [_from, _type, _id, _amount, _value] = event.args;
      values.index = parseInt(_id.toString(), 10);
      values.address = _from;
      var msg = {
        address: user.address,
        message_type: 'REDPACKET',
        content: JSON.stringify(values),
        room_id: room.room_id.toString(),
      };
      var res = await sendMessage(JSON.stringify(msg), token);
      if (res.status.status !== 'ok') {
        alert('send red packet to backend error: ' + res.status.extra_msg);
      } else {
        var message = res.data.message;
        message.username = user.username;
        appendMessage(message);
        
        let msg = { message: res.data.message, user: user, message_type: 'REDPACKET' };
        console.log('msg', msg);
        conn.send(JSON.stringify(msg));
      }
    }
    setShowRedPacket(false);
  }

  const handleCancelRedPacket = () => {
    setShowRedPacket(false);
  }

  return (
    <Modal
      title="send red packet"
      visible={showRedPacket}
      destroyOnClose={true}
      onOk={handleSendRedPacket}
      onCancel={handleCancelRedPacket}
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        initialValues={initialValues}
      >
        {/* <Select defaultValue="MATIC" style={{ width: 120 }} disabled>
          <Option value="MATIC">MATIC</Option>
        </Select> */}
        {/* <Form.Item label='Token' name='token' required={true}> */}
        <Form.Item label='Token' name='token' required={true}>
          <Input defaultValue="MATIC" disabled />
        </Form.Item>
        <Form.Item label='Amount' name='amount' required={true}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label='Value' name='value' required={true}>
          <InputNumber min={0.01} />
        </Form.Item>
      </Form>)
    </Modal>
  )
}

export default RedPacket;