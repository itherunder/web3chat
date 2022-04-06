import { useSignMessage } from "wagmi";
import Router from "next/router";
import { createRoom, signCreateRoom } from "../lib/api";
import { Form, Input, Button, Checkbox, Modal } from "antd";

export const Creator = ({ currentUser, roomName, token, display, setDisplay }) => {
  const [{ data, error, loading }, signMessage] = useSignMessage();
  const [form] = Form.useForm();

  const handleCreate = async () => {
    var values = form.getFieldsValue();
    var description = values.description;
    if (!description || description == "") {
      alert("Please input chat room description!");
      return;
    }
    var res = await signMessage({ message: `I am creating room: ${roomName.toLowerCase()}` });
    if (res.error) {
      alert("You need to sign the message to be able to create chat room.");
      return;
    }
    var signature = res.data;
    res = await signCreateRoom(
      JSON.stringify({ address: currentUser?.address, room_name: roomName, signature }),
      token,
    );
    if (res.status.status !== "ok") {
      alert(res.status.extra_msg);
      return;
    }
    res = await createRoom(
      JSON.stringify({ address: currentUser?.address, room_name: roomName, signature, description }),
      token,
    );
    if (res.status.status !== "ok") {
      alert(res.status.extra_msg);
      return;
    }
    setDisplay(false);
    Router.push("/room/" + roomName);
  };

  const handleCancel = () => {
    setDisplay(false);
  };

  return (
    <Modal title="create room" visible={display} destroyOnClose={true} onOk={handleCreate} onCancel={handleCancel}>
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        // initialValues={{ remember: true }}
        // onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Room Description"
          name="description"
          rules={[{ required: true, message: "Please input chat room description!" }]}
        >
          <Input />
        </Form.Item>

        {/* <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Confirm
          </Button>
          <Button type="link" htmlType="button" onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item> */}
      </Form>
    </Modal>
  );
};
