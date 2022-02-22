package common

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

func CheckDbError(d *gorm.DB) bool {
	if d != nil && d.Error != nil {
		fmt.Println(d.Error)
		return false
	}
	return true
}
