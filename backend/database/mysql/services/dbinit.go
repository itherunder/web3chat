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
	if !db.Db().Migrator().HasTable("users") {
		colorlog.Info("create table: users")
		err := db.Db().AutoMigrate(&User{})
		if err != nil {
			colorlog.Error("create table error: %v", err)
		}
	}
	if !db.Db().Migrator().HasTable("messages") {
		colorlog.Info("create table: messages")
		err := db.Db().AutoMigrate(&Message{})
		if err != nil {
			colorlog.Error("create table error: %v", err)
		}
	}
	if !db.Db().Migrator().HasTable("rooms") {
		colorlog.Info("create table: rooms")
		err := db.Db().AutoMigrate(&Room{})
		if err != nil {
			colorlog.Error("create table error: %v", err)
		}
	}
}
