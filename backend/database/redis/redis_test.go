package redis

import (
	"testing"
	"time"
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
	if v, err := redisDb.GET("6#COIN#4#8"); err != nil {
		t.Errorf("got error %v\n", err)
	} else {
		if v != "12510824343941033" {
			t.Errorf("got v %v\n", v)
		}
	}
}

// should error cause time is expired
func TestSetExpire(t *testing.T) {
	redisDb.SetExpire("6#COIN#4#8", 60*60*24)
	time.Sleep(6 * time.Second)
	TestGET(t)
}
