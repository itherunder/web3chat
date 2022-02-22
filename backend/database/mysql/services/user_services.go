package services

import (
	"strconv"
	"time"
	"web3chat/handlers/common"
)

type User struct {
	UserId    uint64 `gorm:"column:user_id;type:bigint(20) unsigned not null auto_increment primary key"`
	Address   string `gorm:"column:address;type:varchar(60) unique not null default ''"`
	Username  string `gorm:"column:username;type:varchar(40) unique not null default ''"`
	CreatedAt uint64 `gorm:"column:created_at;type:datetime null"`
	IsDeleted bool   `gorm:"column:is_deleted;type:bool not null default false"`
	// todo: store rooms user joined
	// RoomIds   []uint64
}

// find user by user id
func GetUserByUserId(user_id uint64) User {
	var data User
	sql := "select user_id, address, username, created_at, is_deleted from users where user_id=" + strconv.FormatUint(user_id, 10)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// first user log in , metamask connect & sign
func InsertUser(user User) bool {
	curTime := time.Now().Format("2006-01-02 15:04:05")
	sql := "insert users(address, username, created_at) values('" + user.Address + "','" + user.Username + "','" + curTime + "')"
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// find user by address
func GetUserByAddress(address string) User {
	var data User
	sql := "select user_id, address, username, created_at, is_deleted from users where address='" + address + "'"
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// todo: update user info
func UpdateUser(user_id uint64, user User) bool {
	return true
}
