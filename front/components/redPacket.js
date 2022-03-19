
import { Modal, Form, Select, Option, Input, InputNumber } from 'antd';
import { useState } from 'react';
import { useBalance, useTransaction, useContract  } from 'wagmi';
import redPacketABI from '../contracts/abi/redpacket.json'

const RedPacket = ({ showRedPacket, setShowRedPacket, user, token }) => {
  const [ form ] = Form.useForm();
  const [ loading, setLoading ] = useState(false);
  const contract = useContract({
    addressOrName: 'contract address',
    contractInterface: redPacketABI,
  });

  // todo: support these tokens' red packet
  const tokenAddr = { // Polygon Token Address
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  }
  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 18 },
  }
  const initialValues = {
    token: 'MATIC',
    amount: 2,
    value: 0.05,
  }

  const handleSendRedPacket = async () => {
    var values = form.getFieldsValue();
    if (!values.amount || values.amount < 1 || amount % 1 !== 0) {
      alert('amount least 1 and integer');
      return;
    }
    if (!values.value || values.value < 0.05) {
      alert('value at least 0.05 matic');
      return;
    }
    setLoading(true);
    var res = await contract.sendPacket({amount: values.amount, value: values.value});
    // var res = await sendRedPacket(form.values, token);
    setLoading(false);
    setShowRedPacket(false);
  }

  const handleCancelRedPacket = () => {
    setShowRedPacket(false);
  }

  return (
    <Modal
      title="发红包啦"
      visible={showRedPacket}
      destroyOnClose={true}
      onOk={handleSendRedPacket}
      onCancel={handleCancelRedPacket}
    >
    {
      loading?(<Form
        form={form}
        {...layout}
        initialValues={initialValues}
      >
        {/* <Select defaultValue="MATIC" style={{ width: 120 }} disabled>
          <Option value="MATIC">MATIC</Option>
        </Select> */}
        {/* <Form.Item label='代币' name='token' required={true}> */}
        <Form.Item label='代币' name='token' required={true}>
          <Input defaultValue="MATIC" disabled />
        </Form.Item>
        <Form.Item label='个数' name='amount' required={true}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label='价值' name='value' required={true}>
          <InputNumber min={0.01} />
        </Form.Item>
      </Form>):"Loading"
    }
    </Modal>
  )
}

export default RedPacket;