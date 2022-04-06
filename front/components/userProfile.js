import { Descriptions, List, Card, Avatar } from "antd";
import { useEffect, useState } from "react";

const Item = List.Item;
const { Meta } = Card;

// TODO: show addr in explorer
const UserProfile = ({ user, joinedRooms }) => {
  return (
    <div>
      <Descriptions title="User Info" bordered={true} size="small">
        <Descriptions.Item label={<b>Address</b>}>
          <a href={"https://polygonscan.com/address/" + user?.address}>
            {user?.address.substr(0, 4) + "..." + user?.address.substr(-2, 2)}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label={<b>Username</b>}>
          <a>{user?.username}</a>
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions title="Joined Rooms" bordered={true} size="small">
        <Descriptions.Item label={<b>Rooms</b>}>
          <div style={{ height: "400px", overflow: "auto" }}>
            {joinedRooms ? (
              <List
                itemLayout="horizontal"
                dataSource={joinedRooms}
                renderItem={item => (
                  <Item key={item.room_id}>
                    <Card
                      bordered={true}
                      style={{ width: "100%", background: "#FBFBEA" }}
                      // cover={<img alt="picture" src={process.env.NEXT_PUBLIC_PROXY + "/uploads/1_1648006464.jpg"} />}
                      // cover={<img alt="picture" src={process.env.NEXT_PUBLIC_PROXY + "/uploads/1_1648006464.jpg"} />}
                      size="default"
                    >
                      <Meta
                        avatar={<Avatar src={"https://avatars1.githubusercontent.com/u/" + item.room_id.toString()} />}
                        title={<a href={"/room/" + item.room_name}>Room: {item.room_name}</a>}
                        description={item.description}
                      />
                    </Card>
                  </Item>
                )}
              />
            ) : null}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default UserProfile;
