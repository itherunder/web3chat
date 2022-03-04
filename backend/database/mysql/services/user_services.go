package services

import (
	"strconv"
	"time"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

type User struct {
	UserId    uint64    `gorm:"column:user_id;type:bigint(20) unsigned not null auto_increment primary key" json:"user_id"`
	Address   string    `gorm:"column:address;type:varchar(60) unique not null default ''" json:"address"`
	Username  string    `gorm:"column:username;type:varchar(60) unique not null default ''" json:"username"`
	CreatedAt time.Time `gorm:"column:created_at;type:datetime null" json:"created_at"`
	IsDeleted bool      `gorm:"column:is_deleted;type:bool not null default false" json:"is_deleted"`
	// todo: store rooms user joined
	// RoomIds   []uint64
}

// find user by user id
func GetUserByUserId(user_id uint64) User {
	var data User
	sql := "select user_id, address, username, created_at, is_deleted from users where user_id=" + strconv.FormatUint(user_id, 10)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// find user by username
func GetUserByUsername(username string) User {
	var data User
	sql := "select user_id, address, username, created_at, is_deleted from users where username='" + username + "'"
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// first user log in , metamask connect & sign
func InsertUser(user User) bool {
	curTime := time.Now().Format("2006-01-02 15:04:05")
	sql := "insert users(address, username, created_at) values('" + user.Address + "','" + user.Username + "','" + curTime + "')"
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}

// find user by address
func GetUserByAddress(address string) User {
	var data User
	sql := "select user_id, address, username, created_at, is_deleted from users where address='" + address + "'"
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	common.CheckDbError(d)
	return data
}

// todo: update user info
func UpdateUser(user_id uint64, user User) bool {
	sql := "update users set username='" + user.Username + "'" + " where user_id=" + strconv.FormatUint(user_id, 10)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Exec(sql)
	return common.CheckDbError(d)
}
