import { Card } from "antd";
import { useEffect, useState } from 'react';
import redPacketABI from '../contracts/abi/redpacket.json'
import { isOpened as queryIsOpened } from '../lib/api'
import { Contract, ContractFactory, ethers  } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

const RedPacketItem = ({ item, user, token }) => {
  const [ redPacketAddr, setRedPacketAddr ] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [ redPacketContract, setRedPacketContract ] = useState(null);
  const [ signer, setSigner ] = useState(null);
  const [ opened, setOpened ] = useState(false);

  const queryRedPacketStatus = async () => {
    var redpacket = JSON.parse(item.content);
    // check the user has opened before or not
    var res = await queryIsOpened(JSON.stringify({
      user_id: item.from_id.toString(),
      packet_type: redpacket.token === 'ETH' ? "COIN" : "TOKEN",
      index: redpacket.index,
    }), token);
    if (res.status.status != 'ok') {
      alert("error in backend: " + res.status.extra_msg);
      return;
    }
    setOpened(res.data);
  }

  const handleClaim = async () => {
    if (!redPacketContract) {
      alert('red packet contract not set, connect admin');
      return;
    }
    var redpacket = JSON.parse(item.content);

    try {
      var packet = await redPacketContract.packets(redpacket.address, redpacket.index);
    } catch (err) {
      alert('query red packet error: ' + err.message);
      return;
    }
    if (packet.remain === 0) {
      alert('all red packet has been claimed');
      return;
    }
    try {
      const tx = redPacketContract.claimPacket(redpacket.address, redpacket.index);
      const reciept = await tx.wait();
      const event = reciept.events.find(e => e.event === 'ClaimRedPacket');
      const [ _from, _to, _type, _id, _value ] = event.args;
      setOpened(true);
    } catch (err) {
      alert('claim packet error: ', err.message);
      return;
    }
  }

  useEffect(() => {
    if (!user || !token) return;
    const provider = new Web3Provider(window.ethereum);
    // console.log('signer ', provider.getSigner());
    setSigner(provider.getSigner());
    queryRedPacketStatus();
  }, [user, token])

  useEffect(() => {
    if (redPacketAddr === '' || !signer) return;
    if (redPacketContract) return;
    setRedPacketContract(new Contract(redPacketAddr, redPacketABI, signer));
  }, [redPacketAddr, signer])

  return (
    <Card title='redpacket' bordered={true} style={{width:300}}>
      <button type="primary" onClick={handleClaim} disabled={opened}>Open</button>
    </Card>
  )
}

export default RedPacketItem;