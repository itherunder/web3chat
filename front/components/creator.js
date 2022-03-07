import { useSignMessage } from 'wagmi'
import Router from 'next/router'
import { createRoom } from '../lib/api'
import { Form, Input, Button, Checkbox } from 'antd';
import { useState } from 'react';

export const Creator = ({ currentUser, roomName, token, display }) => {
  const [{ data, error, loading }, signMessage] = useSignMessage()
  const [ visible, setVisible ] = useState(display);

  const onFinish = async (values) => {
    await signMessage(`I am creating room: ${roomName.toLowerCase()}`);
    if (!data) {
      alert('You need to sign the message to be able to create chat room.');
      setVisible(false);
      return;
    }
    
    var res = await createRoom(JSON.stringify({ address: currentUser?.address, signature, description }, token));
    if (res.status.status !== 'ok') {
      alert('sign error message.');
      return;
    }
    setVisible(false);
    Router.push('/room/' + roomName);
  }
  
  const onCancel = () => {
    setVisible(false);
  }

  return display?(
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
            Confirm
          </Button>
          <Button type="link" htmlType="button" onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </>
  ):null
}
