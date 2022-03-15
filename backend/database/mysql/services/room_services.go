package services

import (
	"strconv"
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
	IsDeleted   bool      `gorm:"column:is_deleted;type:bool not null default false" json:"is_deleted"`
}

// create a room
func InsertRoom(room Room) bool {
	colorlog.Debug("exec sql: insert rooms %v", room)
	// curTime := time.Now().Format("2006-01-02 15:04:05")
	// sql := "insert into rooms(room_name, description, owner_id, created_at) values('" + room.RoomName + "','" + room.Description + "'," + strconv.FormatUint(room.OwnerId, 10) + ",'" + curTime + "')"
	// d := db.Db().Exec(sql)
	room_ := GetRoomByRoomName(room.RoomName)
	if room_.RoomId != 0 { // has
		if !room_.IsDeleted {
			return false
		}
		room_.IsDeleted = false
		UpdateRoom(room_.RoomId, room_)
		return true
	}
	d := db.Db().Create(&room)
	return common.CheckDbError(d)
}

// only owner and root can delete chat room
func DeleteRoomById(room_id uint64) bool {
	colorlog.Debug("exec sql: update rooms set is_deleted=true where room_id=%v", room_id)
	sql := "update rooms set is_deleted=true where room_id=" + strconv.FormatUint(room_id, 10)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// get the room by room name
func GetRoomByRoomName(room_name string) Room {
	room_name = strings.ToLower(room_name)
	var data Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_name='" + room_name + "'"
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// get the room by owner id
func GetRoomByOnwer(owner_id uint64) []Room {
	var data []Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where owner_id=" + strconv.FormatUint(owner_id, 10) + ""
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// get room by room id
func GetRoomByRoomId(room_id uint64) Room {
	var data Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_id=" + strconv.FormatUint(room_id, 10)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// update room's description or owner id or room name
func UpdateRoom(from_id uint64, room Room) bool {
	room_ := GetRoomByRoomId(room.RoomId)
	if from_id != room_.OwnerId {
		return false
	}
	// changed to is existed
	if room_.RoomName != room.RoomName {
		if GetRoomByRoomName(room.RoomName).RoomId == 0 {
			return false
		}
	}
	sql, flag := "update rooms set ", false
	if room.RoomName != "" {
		sql += "room_name='" + room.RoomName + "'"
		flag = true
	}
	if room.Description != "" {
		if flag {
			sql += ","
		}
		sql += "description='" + room.Description + "'"
	}
	if room.OwnerId != 0 {
		if flag {
			sql += ","
		}
		sql += "owner_id=" + strconv.FormatUint(room.OwnerId, 10)
	}
	sql += ",is_deleted=" + strconv.FormatBool(room.IsDeleted)
	sql += " where room_id=" + strconv.FormatUint(room.RoomId, 10)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}
