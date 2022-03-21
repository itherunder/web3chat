import { Card, Avatar, Button } from "antd";
import { useEffect, useState } from 'react';
import redPacketABI from '../contracts/abi/redpacket.json'
import { isOpened as queryIsOpened, openRedPacket } from '../lib/api'
import { Contract, ContractFactory, ethers  } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import Image from "next/image";

const { Meta } = Card;

const RedPacketItem = ({ item, user, token }) => {
  const [ redPacketAddr, setRedPacketAddr ] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [ redPacketContract, setRedPacketContract ] = useState(null);
  const [ signer, setSigner ] = useState(null);
  const [ opened, setOpened ] = useState([false, '']);

  const queryRedPacketStatus = async () => {
    var redpacket = JSON.parse(item.content);
    // check the user has opened before or not
    var res = await queryIsOpened(JSON.stringify({
      user_id: item.from_id.toString(),
      packet_type: redpacket.token === 'ETH' ? "COIN" : "TOKEN",
      index: redpacket.index.toString(),
    }), token);
    if (res.status.status != 'ok') {
      alert("error in backend: " + res.status.extra_msg);
      return;
    }
    setOpened([res.data.opened, res.data.value === '' ? '' : ethers.utils.formatEther(res.data.value)]);
  }

  const handleClaim = async () => {
    if (!redPacketContract) {
      alert('red packet contract not set, connect admin');
      return;
    }
    var redpacket = JSON.parse(item.content);
    console.log('claim redpacket: ', redpacket);

    try {
      var packet = await redPacketContract.packets(redpacket.address, redpacket.index);
    } catch (err) {
      alert('query red packet error: ' + err.message);
      return;
    }
    if (packet.remain.toString() === '0') {
      alert('all red packet has been claimed');
      setOpened([true, 'all gone']);
      return;
    }
    console.log('packet: ', packet);
    try {
      const tx = await redPacketContract.claimPacket(redpacket.address, redpacket.index);
      const reciept = await tx.wait();
      const event = reciept.events.find(e => e.event === 'ClaimRedPacket');
      const [ _from, _to, _type, _id, _value ] = event.args;
      alert('congrats, you claimed ' + _value.toString() + '!');
      setOpened([true, ethers.utils.formatEther(_value.toString())]);

      // set backend as opened with redis
      var res = await openRedPacket(JSON.stringify({
        user_id: item.from_id.toString(),
        packet_type: redpacket.token === 'ETH' ? "COIN" : "TOKEN",
        index: redpacket.index.toString(),
        value: _value.toString(),
      }), token);
      if (res.status.status != 'ok') {
        alert('error in backend: ' + res.status.extra_msg);
      }
    } catch (err) {
      alert('claim packet error: ', err.message);
      setOpened([false, '']);
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

  // todo: show transaction of claim red packet
  const showClaimDetail = async () => {}

  const abbr = (value) => {
    const r = value.split('.')
    if (r.length == 1) return r;
    return r[0] + '.' + r[1].substr(0, r[1].length > 4 ? 4 : r[1].length);
  }

  return (
    <Card
      // title='redpacket'
      bordered={true}
      style={{ width: '80%', background: '#FBFBEA' }}
      cover={<img alt="redpacket" src="/logo.png" />}
    >
      <Meta
        avatar={<Avatar src={"https://joeschmoe.io/api/v1/" + item.from_id.toString()} />}
        title="恭喜发财，大吉大利"
        // description="fuck you"
      />
      <button type="primary" onClick={handleClaim} hidden={opened[0]} disabled={opened[0]}>Open</button>
      {opened[0] ? (<button type="primary" onClick={showClaimDetail}>
        {opened[1] === '' ? 'error' : abbr(opened[1])}
      </button>) : null}
    </Card>
  )
}

export default RedPacketItem;
