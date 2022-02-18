package services

import (
	"log"
	"strconv"
	"time"
	"web3chat/common"
)

type Room struct {
	RoomId      uint64    `gorm:"column:room_id;type:bigint(20) unsigned not null auto_increment primary key"`
	RoomName    string    `gorm:"column:room_name;type:varchar(40) unique not null"`
	Description string    `gorm:"column:description;type:varchar(80) not null"`
	OwnerId     uint64    `gorm:"column:owner_id;type:bigint(20) unsigned not null"`
	CreatedAt   time.Time `gorm:"column:created_at;type:datetime null"`
	IsDeleted   bool      `gorm:"column:is_deleted;type:bool not null default false"`
}

// create a room
func InsertRoom(room Room) bool {
	curTime := time.Now().Format("2006-01-02 15:04:05")
	sql := "insert into rooms(room_name, description, owner_id, created_at, is_deleted) values('" + room.RoomName + "','" + room.RoomName + "'," + strconv.FormatUint(room.OwnerId, 10) + ",'" + curTime + "','" + strconv.FormatBool(room.IsDeleted) + "')"
	log.Println("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// only owner and root can delete chat room
func DeleteRoomById(room_id uint64) bool {
	sql := "update rooms set is_deleted=false where room_id=" + strconv.FormatUint(room_id, 10)
	log.Println("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// find the room by room name
func FindRoomByRoomName(room_name string) Room {
	var data Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_name='" + room_name + "'"
	d := db.Db().Raw(sql).Scan(data)
	common.CheckDbError(d)
	return data
}

// find the room by owner id
func FindRoomByOnwer(owner_id uint64) []Room {
	var data []Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where owner_id=" + strconv.FormatUint(owner_id, 10) + ""
	d := db.Db().Raw(sql).Scan(data)
	common.CheckDbError(d)
	return data
}

// find room by room id
func FindRoomByRoomId(room_id uint64) Room {
	var data Room
	sql := "select room_id, room_name, description, owner_id, created_at, is_deleted from rooms where room_id=" + strconv.FormatUint(room_id, 10)
	d := db.Db().Raw(sql).Scan(data)
	common.CheckDbError(d)
	return data
}

// update room's description or owner id or room name
func UpdateRoom(from_id uint64, room Room) bool {
	room_ := FindRoomByRoomId(room.RoomId)
	if from_id != room_.OwnerId {
		return false
	}
	// changed to is existed
	if room_.RoomName != room.RoomName {
		if FindRoomByRoomName(room.RoomName).RoomId == 0 {
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
	sql += " where room_id=" + strconv.FormatUint(room.RoomId, 10)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}
