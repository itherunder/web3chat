package services

import (
	"encoding/json"
	"fmt"
	"strconv"
	"testing"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

func TestGetRoomByRoomName(t *testing.T) {
	roomName := "public"
	room := GetRoomByRoomName(roomName)
	fmt.Printf("room: %v\n", room)
}

func TestGetUserByUsername(t *testing.T) {
	username := "itherunder"
	user := GetUserByUsername(username)
	fmt.Printf("user: %v\n", user)
}

func TestUnmarshalJson(t *testing.T) {
	var message Message
	b := []byte(`{"message_id":0,"content":"test ws from chrome","from_id":2,"to_id":0,"room_id":1,"created_at":"2022-03-04T15:58:41.9442752+08:00","modified_at":"0001-01-01T00:00:00Z"}`)
	if err := json.Unmarshal(b, &message); err != nil {
		t.Errorf("err when unmarshal: %v", err)
	}

	var tt struct {
		Id   int    `json:"id"`
		Name string `json:"name"`
	}
	b = []byte(`{"id":1,"name":"itherunder"}`)
	if err := json.Unmarshal(b, &tt); err != nil {
		t.Errorf("err when unmarshal: %v", err)
	}
}

func TestGetMessagesByRoomId(t *testing.T) {
	var room_id uint64 = 1
	var data []map[string]interface{}
	limit := 10
	sql := "select m.message_id, u.username, m.content, m.from_id, m.to_id, m.room_id, m.created_at, m.modified_at from messages m inner join users u on m.from_id = u.user_id where m.room_id =" + strconv.FormatUint(room_id, 10) + " order by m.created_at desc limit " + strconv.Itoa(limit)
	colorlog.Debug("exec sql: " + sql)
	d := db.Db().Raw(sql).Scan(&data)
	if !common.CheckDbError(d) {
		t.Errorf("err")
	}
	for _, msg := range data {
		colorlog.Debug("msg result: %v", msg["username"])
	}
}
