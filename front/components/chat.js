import { Avatar, List, NavBar, Icon, InputItem, Grid } from 'antd';

const Item = List.Item

const Chat = ({ messages, user }) => {
  return (
    <>
      <div id='chat-page'>
        <List style={{ marginBottom: 50, marginTop: 50 }}>
          {/* <QueueAnim type='left' dalay={100}> */}
          {
            messages?(messages.map((message, index) => {
              console.log(message, index);
              return (
                <Item
                  key={message.message_id}
                  thumb={targetIcon}>
                  {message.content}
                </Item>
              )
            })):null
          }
          {/* </QueueAnim> */}
        </List>
        <div className='am-tab-bar'>
          <InputItem
            placeholder='请输入'
            // value={this.state.content}
            // onChange={val => this.setState({ content: val })}
            // onFocus={() => this.setState({ isShow: false })}
            extra={
              <span>
                <span role="img" onClick={this.toggleShow} style={{ marginRight: 5 }}>😊</span>
                <span onClick={this.handleSend}>发送</span>
              </span>
            }
          />
          {
            this.state.isShow ? (
              <Grid
                data={this.emojis}
                columnNum={8}
                carouselMaxRow={4}
                isCarousel={true}
                onClick={(item) => {
                  this.setState({ content: this.state.content + item.text })
                }}
              />
            ) : null
          }
        </div>
      </div>
    </>
  )
}

export default Chat;