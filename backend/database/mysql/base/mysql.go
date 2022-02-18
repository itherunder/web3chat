package base

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type MySqlDb struct {
	db *gorm.DB
}

func NewMySqlDb() *MySqlDb {
	db, err := gorm.Open("mysql", "root:1234@tcp(localhost:3306)/web3chat?charset=utf8&parseTime=True&loc=Local")
	if err != nil {
		panic(err)
	}
	return &MySqlDb{
		db: db,
	}
}

func (mysql *MySqlDb) Close() {
	mysql.db.Close()
}

func (mysql *MySqlDb) Db() *gorm.DB {
	return mysql.db
}
