package services

import (
	"web3chat/database/mysql/base"

	"github.com/yezihack/colorlog"
)

var db *base.MySqlDb

func init() {
	db = base.NewMySqlDb()
	colorlog.Info("db init")
	CreateTable()
}

func CreateTable() {
	d := db.Db().AutoMigrate(&Message{})
	if d != nil && d.Error != nil {
		colorlog.Error("%v", d.Error)
	}
	d = db.Db().AutoMigrate(&User{})
	if d != nil && d.Error != nil {
		colorlog.Error("%v", d.Error)
	}
	d = db.Db().AutoMigrate(&Room{})
	if d != nil && d.Error != nil {
		colorlog.Error("%v", d.Error)
	}
}
