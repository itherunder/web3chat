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
	err := db.Db().AutoMigrate(&Message{})
	if err != nil {
		colorlog.Error("create table error: %v", err)
	}
	err = db.Db().AutoMigrate(&User{})
	if err != nil {
		colorlog.Error("create table error: %v", err)
	}
	err = db.Db().AutoMigrate(&Room{})
	if err != nil {
		colorlog.Error("create table error: %v", err)
	}
}
