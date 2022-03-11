import { Avatar, List, NavBar, Icon, Grid } from 'antd';
import { useState } from 'react';
import styles from './chat.module.css'

const Item = List.Item

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
];

const Chat = ({ messages, user }) => {
  return (
    <div id='container'>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar size="small" src="https://joeschmoe.io/api/v1/random" />}
              title={<a href="https://ant.design">{item.title}</a>}
              description="Ant"
            />
          </List.Item>
        )}
      />
    </div>
  )

  const [ showExtra, setShowExtra ] = useState(false);
  const [ content, setContent ] = useState('');

  const handleShow = () => {

  }

  const handleSend = () => {

  }

  return (
    <>
    {
      messages?(
      <div>
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={item => (
            <Item>
              <Item.Meta
                avatar={<Avatar size='small' src="https://joeschmoe.io/api/v1/random" />}
                title={<a href="https://ant.design">{item.username}</a>}
                description={item.content}
              />
            </Item>
          )}
        />
      </div>):null
    }
    {
      showExtra?(
        <Grid
          
        />
      ):null
    }
    </>
  )
}

export default Chat;