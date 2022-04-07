package services

import (
	"strings"
	"time"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

type Room struct {
	RoomId      uint64    `gorm:"column:room_id;type:bigint(20) unsigned not null auto_increment primary key" json:"room_id"`
	RoomName    string    `gorm:"column:room_name;type:varchar(40) unique not null" json:"room_name"`
	Description string    `gorm:"column:description;type:varchar(80) not null" json:"description"`
	OwnerId     uint64    `gorm:"column:owner_id;type:bigint(20) unsigned not null" json:"owner_id"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamp null default now()" json:"created_at"`
	UsersCount  int       `gorm:"column:users_count;type:int not null default 0" json:"users_count"`
	IsDeleted   bool      `gorm:"column:is_deleted;type:boolean not null default false" json:"is_deleted"`
}

// create a room
func InsertRoom(room *Room) bool {
	colorlog.Debug("exec sql: insert rooms %v", room)
	// curTime := time.Now().Format("2006-01-02 15:04:05")
	// sql := "insert into rooms(room_name, description, owner_id, created_at) values('" + room.RoomName + "','" + room.Description + "'," + strconv.FormatUint(room.OwnerId, 10) + ",'" + curTime + "')"
	// d := db.Db().Exec(sql)
	room_ := GetRoomByRoomName(room.RoomName)
	if room_.RoomId != 0 { // has
		if !room_.IsDeleted {
			colorlog.Error("insert a existed room")
			return false
		}
		if !RecoverRoomById(room_.RoomId) {
			colorlog.Error("recover room error")
			return false
		}
		return true
	}
	d := db.Db().Create(room)
	return common.CheckDbError(d)
}

// only owner and root can delete chat room
func DeleteRoomById(room_id uint64) bool {
	colorlog.Debug("exec sql: update rooms set is_deleted=true where room_id=%v", room_id)
	// sql := "update rooms set is_deleted=true where room_id=" + strconv.FormatUint(room_id, 10)
	// d := db.Db().Exec(sql)
	d := db.Db().Model(&Room{}).Where("room_id = ?", room_id).Update("is_deleted", true)
	return common.CheckDbError(d)
}

// only owner and root can recover chat room
func RecoverRoomById(room_id uint64) bool {
	colorlog.Debug("exec sql: update rooms set is_deleted=false where room_id=%v", room_id)
	// sql := "update rooms set is_deleted=true where room_id=" + strconv.FormatUint(room_id, 10)
	// d := db.Db().Exec(sql)
	d := db.Db().Model(&Room{}).Where("room_id = ?", room_id).Update("is_deleted", false)
	return common.CheckDbError(d)
}

// get the room by room name
func GetRoomByRoomName(room_name string) Room {
	colorlog.Debug("exec sql: select * from rooms where room_name=%v", room_name)
	room_name = strings.ToLower(room_name)
	var data Room
	// sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_name='" + room_name + "'"
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("room_name = ?", room_name).Take(&data)
	common.CheckDbError(d)
	return data
}

// get the room by owner id
func GetRoomsByOnwer(owner_id uint64) []Room {
	colorlog.Debug("exec sql: select * from rooms where owner_id=%v", owner_id)
	var data []Room
	// sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where owner_id=" + strconv.FormatUint(owner_id, 10) + ""
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("owner_id = ? and is_deleted = false", owner_id).Find(&data)
	common.CheckDbError(d)
	return data
}

// get room by room id
func GetRoomByRoomId(room_id uint64) Room {
	colorlog.Debug("exec sql: select * from rooms where room_id=%v", room_id)
	var data Room
	// sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_id=" + strconv.FormatUint(room_id, 10)
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("room_id = ?", room_id).Take(&data)
	common.CheckDbError(d)
	return data
}

// update room's description or owner id or room name
func UpdateRoom(from_id uint64, room Room) bool {
	room_ := GetRoomByRoomId(room.RoomId)
	if from_id != room_.OwnerId {
		colorlog.Error("only owner of room can update room")
		return false
	}
	// changed to is existed
	if room.RoomName != "" && room_.RoomName != room.RoomName {
		if GetRoomByRoomName(room.RoomName).RoomId == 0 {
			colorlog.Error("the room name %v u wanna changed to has exist", room.RoomName)
			return false
		}
	}
	colorlog.Debug("exec sql: update room %v", room)
	// sql, flag := "update rooms set ", false
	// if room.RoomName != "" {
	// 	sql += "room_name='" + room.RoomName + "'"
	// 	flag = true
	// }
	// if room.Description != "" {
	// 	if flag {
	// 		sql += ","
	// 	}
	// 	sql += "description='" + room.Description + "'"
	// }
	// if room.OwnerId != 0 {
	// 	if flag {
	// 		sql += ","
	// 	}
	// 	sql += "owner_id=" + strconv.FormatUint(room.OwnerId, 10)
	// }
	// sql += ",is_deleted=" + strconv.FormatBool(room.IsDeleted)
	// sql += " where room_id=" + strconv.FormatUint(room.RoomId, 10)
	// d := db.Db().Exec(sql)
	d := db.Db().Model(&Room{}).Where("room_id = ?", room.RoomId).Updates(&room)
	return common.CheckDbError(d)
}
