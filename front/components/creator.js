import { useSignMessage } from 'wagmi'
import Router from 'next/router'
import { createRoom } from '../lib/api'
import { Form, Input, Button, Checkbox } from 'antd';

export const Creator = ({ currentUser, roomName, token, display, setDisplay }) => {
  const [{ data, error, loading }, signMessage] = useSignMessage()

  const onFinish = async (values) => {
    var description = values.description;
    if (!description || description == '') {
      alert('Please input chat room description!');
      return;
    }
    var res = await signMessage({message: `I am creating room: ${roomName.toLowerCase()}`});
    if (res.error) {
      alert('You need to sign the message to be able to create chat room.');
      return;
    }
    var signature = res.data;
    res = await createRoom(JSON.stringify({ address: currentUser?.address, signature, description }, token));
    if (res.status.status !== 'ok') {
      alert('sign error message may the connected wallet is not right.');
      return;
    }
    setDisplay(false);
    Router.push('/room/' + roomName);
  }
  
  const onCancel = () => {
    setDisplay(false);
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
          // rules={[{ required: true, message: 'Please input chat room description!' }]}
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
