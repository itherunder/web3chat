package services

import (
	"strconv"
	"time"
	"web3chat/database/redis"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

type Message struct {
	MessageId   uint64             `gorm:"column:message_id;type:bigint(20) unsigned not null auto_increment primary key" json:"message_id"`
	MessageType common.MessageType `gorm:"column:message_type;type:varchar(10) not null default 'TEXT'" json:"message_type"`
	Content     string             `gorm:"column:content;type:text not null" json:"content"`
	FromId      uint64             `gorm:"column:from_id;type:bigint(20) unsigned not null" json:"from_id"`
	ToId        uint64             `gorm:"column:to_id;type:bigint(20) unsigned not null default 0" json:"to_id"`
	RoomId      uint64             `gorm:"column:room_id;type:bigint(20) unsigned not null default 0" json:"room_id"`
	CreatedAt   time.Time          `gorm:"column:created_at;type:timestamp null default now()" json:"created_at"`
	ModifiedAt  time.Time          `gorm:"column:modified_at;type:timestamp null" json:"modified_at"`
}

// get limit messages by room id
// todo: other ways to get messages
func GetMessagesByRoomId(room_id uint64, limit int) ([]map[string]interface{}, bool) {
	var data []map[string]interface{}
	// sql := "select message_id, content, from_id, to_id, room_id, created_at, modified_at from messages where room_id=" + strconv.FormatUint(room_id, 10) + " order by created_at desc limit " + strconv.Itoa(limit)
	sql := "select m.message_id, m.message_type, u.username, m.content, m.from_id, m.to_id, m.room_id, m.created_at, m.modified_at from messages m inner join users u on m.from_id = u.user_id where m.room_id =" + strconv.FormatUint(room_id, 10) + " order by m.created_at desc limit " + strconv.Itoa(limit)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	return data, common.CheckDbError(d)
}

func InsertMessage(message Message) bool {
	colorlog.Debug("exec sql: insert messages value %v", message)
	// curTime := time.Now().Format("2006-01-02 15:04:05")
	// sql := "insert into messages(message_type, content, from_id, to_id, room_id, created_at, modified_at) values('" + message.MessageType + "','" + message.Content + "'," + strconv.FormatUint(message.FromId, 10) + "," + strconv.FormatUint(message.ToId, 10) + "," + strconv.FormatUint(message.RoomId, 10) + ",'" + curTime + "','" + curTime + "')"
	// d := db.Db().Exec(sql)
	d := db.Db().Create(&message)
	return common.CheckDbError(d)
}

func IsOpened(json map[string]string, user User) bool {
	// from_user_id, packet_type, packet_index
	key := json["user_id"] + "#" + json["packet_type"] + "#" + json["index"]
	key += "#" + strconv.FormatUint(user.UserId, 10)
	if _, err := redis.RedisDbInstance().GET(key); err != nil {
		return false
	}
	return true
}

// expired in one day, because the red packet will be refunded after one day
func SetOpened(json map[string]string, user User) bool {
	// from_user_id, packet_type, packet_index
	key := json["user_id"] + "#" + json["packet_type"] + "#" + json["index"]
	key += "#" + strconv.FormatUint(user.UserId, 10)
	if _, err := redis.RedisDbInstance().SetExpire(key, 60*60*24); err != nil {
		return false
	}
	return true
}
