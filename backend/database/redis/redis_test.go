package redis

import (
	"testing"
	"time"

	"github.com/yezihack/colorlog"
)

func TestCreateConn(t *testing.T) {
	if redisDb, err := CreateConn(); err != nil {
		t.Errorf("CreateConn error: %v\n", err)
	} else {
		if redisDb == nil {
			t.Error("CreateConn created a nil redisDb\n")
		}
	}
}

// no error
func TestSET(t *testing.T) {
	if v, err := redisDb.SET("6#COIN#4#8", "12510824343941033"); err != nil {
		t.Errorf("got error %v\n", err)
	} else {
		if v != "OK" {
			t.Errorf("got v %v\n", v)
		}
	}
}

// no error
func TestGET(t *testing.T) {
	if v, err := redisDb.GET("3#COIN#1#2"); err != nil {
		t.Errorf("got error %v\n", err)
	} else {
		if v != "12510824343941033" {
			t.Errorf("got v %v\n", v)
		}
	}
}

// should error cause time is expired
func TestSetExpire(t *testing.T) {
	if _, err := redisDb.SetExpire("2#COIN#0#2", 60*60*24); err != nil {
		colorlog.Debug("set expire error: %s", err.Error())
	}
	time.Sleep(6 * time.Second)
	// TestGET(t)
}
