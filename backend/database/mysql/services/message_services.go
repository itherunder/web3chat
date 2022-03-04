package services

import (
	"encoding/json"
	"strconv"
	"time"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

type Message struct {
	MessageId  uint64    `gorm:"column:message_id;type:bigint(20) unsigned not null auto_increment primary key" json:"message_id"`
	Content    string    `gorm:"column:content;type:text not null" json:"content"`
	FromId     uint64    `gorm:"column:from_id;type:bigint(20) unsigned not null" json:"from_id"`
	ToId       uint64    `gorm:"column:to_id;type:bigint(20) unsigned not null default 0" json:"to_id"`
	RoomId     uint64    `gorm:"column:room_id;type:bigint(20) unsigned not null default 0" json:"room_id"`
	CreatedAt  time.Time `gorm:"column:created_at;type:datetime null" json:"created_at"`
	ModifiedAt time.Time `gorm:"column:modified_at;type:datetime null" json:"modified_at"`
}

// get limit messages by room id
// todo: other ways to get messages
func GetMessagesByRoomId(room_id uint64, limit int) ([]Message, bool) {
	var data []Message
	sql := "select message_id, content, from_id, to_id, room_id, created_at, modified_at from messages where room_id=" + strconv.FormatUint(room_id, 10) + " order by created_at desc limit " + strconv.Itoa(limit)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	return data, common.CheckDbError(d)
}

func InsertMessages(message Message) bool {
	curTime := time.Now().Format("2006-01-02 15:04:05")
	sql := "insert into messages(content, from_id, to_id, room_id, created_at, modified_at) values('" + message.Content + "'," + strconv.FormatUint(message.FromId, 10) + "," + strconv.FormatUint(message.ToId, 10) + "," + strconv.FormatUint(message.RoomId, 10) + ",'" + curTime + "','" + curTime + "')"
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// message to bytes
func (message Message) ToBytes() []byte {
	if bytesMessage, err := json.Marshal(message); err != nil {
		colorlog.Error("Marshal message error: %v", err)
		return []byte("")
	} else {
		return bytesMessage
	}
}
