package common

import (
	"github.com/jinzhu/gorm"
	"github.com/yezihack/colorlog"
)

func CheckDbError(d *gorm.DB) bool {
	if d != nil && d.Error != nil {
		colorlog.Error("%v", d.Error)
		return false
	}
	return true
}
