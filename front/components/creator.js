import { useSignMessage } from 'wagmi'
import Router from 'next/router'
import { createRoom } from '../lib/api'
import { Form, Input, Button, Checkbox } from 'antd';


export const Connector = ({ address, roomName, token }) => {
  const [{ data, error, loading }, signMessage] = useSignMessage()

  const onFinish = async (values) => {
    var res = null;
    await signMessage(`I am creating room: ${roomName.toLowerCase()}`);
    if (!data) {
      alert('You need to sign the message to be able to create chat room.');
      return;
    }
    
    res = await createRoom(JSON.stringify({ address, signature }, token));
    if (res.status.status !== 'ok') {
      alert('sign error message.');
      return;
    }
    
  }

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Room Description"
          name="description"
          rules={[{ required: true, message: 'Please input chat room description!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
