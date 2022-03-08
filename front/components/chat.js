
import { Avatar } from 'antd';

const Chat = ({ messages }) => {
  return (
    <>
      {
        messages.map((item, index) => {
          return (
            <div className={styles["chat-item"]} key={item.messageId || index}>
              <div className={styles["chat-sender"]}>
                <div className={styles.content}>{item.content}</div>
                <div className={styles["avatar-wrap"]}>
                  <div className={styles.avatar}>
                    <Avatar
                      size="large"
                      style={{ backgroundColor: "#005EFF", verticalAlign: "middle" }}
                    >
                      {userName}
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      }
    </>
  )
}

export default Chat;