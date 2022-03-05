package base

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type MySqlDb struct {
	db *gorm.DB
}

func NewMySqlDb() *MySqlDb {
	db, err := gorm.Open(mysql.Open("root:1234@tcp(localhost:3306)/web3chat?charset=utf8&parseTime=True&loc=Local"))
	if err != nil {
		panic(err)
	}
	return &MySqlDb{
		db: db,
	}
}

func (mysql *MySqlDb) Db() *gorm.DB {
	return mysql.db
}
