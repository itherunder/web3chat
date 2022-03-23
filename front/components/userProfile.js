import { Descriptions, List } from "antd";
import { useEffect, useState } from "react";

const [ Item ] = List;

const UserProfile = ( { user, joinedRooms } ) => {
  return (
    <div>
      {/* <h3>Address: {user?.address.substr(0, 4) + '...' + user?.address.substr(-2,2)}</h3>
      <h3>Username: {user?.username}</h3> */}
      <Descriptions title='User Info' bordered={true} size="small">
        <Descriptions.Item label='address'>
          {user?.address.substr(0, 4) + '...' + user?.address.substr(-2,2)}
        </Descriptions.Item>
        <Descriptions.Item label='username'>{user?.username}</Descriptions.Item>
      </Descriptions>
      <br/><div id='chat' className={styles.chat}>
        {
          joinedRooms ? (
          <List
            itemLayout="horizontal"
            dataSource={joinedRooms}
            renderItem={item => (
              <Item>
                <Card
                  bordered={true}
                  style={{ width: '80%', background: '#FBFBEA' }}
                  cover={<img alt="picture" src={process.env.NEXT_PUBLIC_PROXY + "/uploads/" + JSON.parse(item.content).picture} />}
                >
                  <Meta
                    avatar={<Avatar src={"https://joeschmoe.io/api/v1/" + item.from_id.toString()} />}
                    description={JSON.parse(item.content).content}
                  />
                </Card>
                <span className={styles.time}>{item.created_at.substr(0,10) + ' '+ item.created_at.substr(11,8)}</span>
              </Item>
            )}
          />):null
        }
      </div>
    </div>
  )
}

export default UserProfile;
