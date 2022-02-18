package services

import (
	"fmt"
	"log"
	"strconv"
	"time"
	"web3chat/common"
)

type Message struct {
	MessageId  uint64    `gorm:"column:message_id;type:bigint(20) unsigned not null auto_increment primary key"`
	Content    string    `gorm:"column:content;type:text not null"`
	FromId     uint64    `gorm:"column:from_id;type:bigint(20) unsigned not null"`
	ToId       uint64    `gorm:"column:to_id;type:bigint(20) unsigned not null default 0"`
	RoomId     uint64    `gorm:"column:room_id;type:bigint(20) unsigned not null default 0"`
	CreatedAt  time.Time `gorm:"column:created_at;type:datetime null"`
	ModifiedAt time.Time `gorm:"column:modified_at;type:datetime null"`
}

func GetMessageByRoom(room_id uint64) []Message {
	var data []Message
	sql := "select message_id, content, from_id, to_id, room_id, created_at, modified_at from messages where room_id=" + strconv.FormatUint(room_id, 10)
	fmt.Println("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

func InsertMessages(message Message) bool {
	curTime := time.Now().Format("2006-01-02 15:04:05")
	sql := "insert into messages(content, from_id, to_id, room_id, created_at, modified_at) values('" + message.Content + "'," + strconv.FormatUint(message.FromId, 10) + "," + strconv.FormatUint(message.ToId, 10) + "," + strconv.FormatUint(message.RoomId, 10) + ",'" + curTime + "','" + curTime + "')"
	log.Println("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}
