package services

import (
	"fmt"
	"web3chat/database/mysql/base"
)

var db *base.MySqlDb

func init() {
	db = base.NewMySqlDb()
	fmt.Println("db init")
	CreateTable()
}

func CreateTable() {
	d := db.Db().AutoMigrate(&Message{})
	if d != nil && d.Error != nil {
		fmt.Println(d.Error)
	}
	// db.Db().AutoMigrate(&Room{})
	// db.Db().AutoMigrate(&User{})
}
