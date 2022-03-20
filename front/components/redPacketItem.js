import { Card } from "antd";
import { useEffect, useState } from 'react';
import redPacketABI from '../contracts/abi/redpacket.json'

const RedPacketItem = ({ item, user }) => {
  const [ redPacketAddr, setRedPacketAddr ] = useState(process.env.NEXT_PUBLIC_REDPACKET_ADDRESS);
  const [ redPacketContract, setRedPacketContract ] = useState(null);
  const [ signer, setSigner ] = useState(null);

  const handleClaim = async () => {
    
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

  return (
    <Card title='redpacket' bordered={true} style={{width:300}}>
      <button type="primary" onClick={handleClaim}>Open</button>
    </Card>
  )
}

export default RedPacketItem;