package services

import (
	"time"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

// TODO: store rooms user joined
type User struct {
	UserId    uint64    `gorm:"column:user_id;type:bigint(20) unsigned not null auto_increment primary key" json:"user_id"`
	Address   string    `gorm:"column:address;type:varchar(60) unique not null default ''" json:"address"`
	Username  string    `gorm:"column:username;type:varchar(60) unique not null default ''" json:"username"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp default now()" json:"created_at"`
	IsDeleted bool      `gorm:"column:is_deleted;type:bool not null default false" json:"is_deleted"`
	Rooms     string    `gorm:"column:rooms;type:text" json:"rooms"`
}

// find user by user id
func GetUserByUserId(user_id uint64) User {
	colorlog.Debug("exec sql: select * from users where user_id = %v", user_id)
	var data User
	// sql := "select user_id, address, username, created_at, is_deleted from users where user_id=" + strconv.FormatUint(user_id, 10)
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("user_id = ?", user_id).Take(&data)
	common.CheckDbError(d)
	return data
}

// find user by username
func GetUserByUsername(username string) User {
	colorlog.Debug("exec sql: select * from users where username = %v", username)
	var data User
	// sql := "select user_id, address, username, created_at, is_deleted from users where username='" + username + "'"
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("username = ?", username).Take(&data)
	common.CheckDbError(d)
	return data
}

// first user log in , metamask connect & sign
func InsertUser(user User) bool {
	colorlog.Debug("exec sql: insert users %v", user)
	// curTime := time.Now().Format("2006-01-02 15:04:05")
	// sql := "insert users(address, username, created_at) values('" + user.Address + "','" + user.Username + "','" + curTime + "')"
	// d := db.Db().Exec(sql)
	d := db.Db().Create(&user)
	return common.CheckDbError(d)
}

// find user by address
func GetUserByAddress(address string) User {
	colorlog.Debug("exec sql: select * from users where address = %v", address)
	var data User
	// sql := "select user_id, address, username, created_at, is_deleted from users where address='" + address + "'"
	// d := db.Db().Raw(sql).Scan(&data)
	d := db.Db().Where("address = ?", address).Take(&data)
	common.CheckDbError(d)
	return data
}

// TODO: update user info
func UpdateUser(user_id uint64, user User) bool {
	colorlog.Debug("exec sql: update users %v", user)
	if user_id != user.UserId {
		return false
	}
	// sql := "update users set username='" + user.Username + "'" + " where user_id=" + strconv.FormatUint(user_id, 10)
	// d := db.Db().Exec(sql)
	d := db.Db().Where("user_id = ?", user_id).Save(user)
	return common.CheckDbError(d)
}
