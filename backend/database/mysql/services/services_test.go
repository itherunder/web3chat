package services

import (
	"encoding/json"
	"testing"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

func TestCreateTable(t *testing.T) {
	if db.Db().Migrator().HasTable("users") {
		colorlog.Debug("has table: users")
	} else {
		t.Error("have no table: users")
	}
}

//////////////// user services

func TestGetUserByUserId(t *testing.T) {
	user := GetUserByUserId(1)
	if user.UserId == 0 {
		t.Error("error")
	}
	colorlog.Debug("user: %v", user)
}

func TestGetUserByUsername(t *testing.T) {
	username := "itherunder"
	user := GetUserByUsername(username)
	colorlog.Debug("user: %v\n", user)
}

func TestInsertUser(t *testing.T) {
	user := User{
		Address:  "0xa215834C18Ee35AA6f2bC9aeaC3bA8345DfC2036",
		Username: "unit test",
	}
	if !InsertUser(user) {
		t.Error("error")
	}
	colorlog.Debug("user: %v", GetUserByUsername("unit test"))
}

func TestGetUserByAddress(t *testing.T) {
	user := GetUserByAddress("0xa215834C18Ee35AA6f2bC9aeaC3bA8345DFC2036")
	colorlog.Debug("user: %v\n", user)
}

func TestUpdateUser(t *testing.T) {
	user := GetUserByUserId(1)
	user.Username = "unit update test"
	if !UpdateUser(1, user) {
		t.Errorf("update error, %v", user)
	}
}

//////////////// room services

func TestInsertRoom(t *testing.T) {
	room := Room{
		RoomName:    "unit test",
		Description: "unit test",
		OwnerId:     1,
	}
	if !InsertRoom(room) {
		t.Error("error when insert room")
	}
}

func TestDeleteRoomById(t *testing.T) {
	if !DeleteRoomById(1) {
		t.Error("error when delete room")
	}
}

func TestGetRoomByRoomName(t *testing.T) {
	roomName := "unit test"
	room := GetRoomByRoomName(roomName)
	colorlog.Debug("room: %v\n", room)
}

func TestGetRoomsByOnwer(t *testing.T) {
	rooms := GetRoomsByOnwer(1)
	colorlog.Debug("rooms: %v", rooms)
}

func TestGetRoomByRoomId(t *testing.T) {
	room := GetRoomByRoomId(1)
	colorlog.Debug("room: %v", room)
}

func TestUpdateRoom(t *testing.T) {
	room := Room{
		RoomId:      1,
		Description: "update unit test",
		OwnerId:     1,
		IsDeleted:   false,
	}
	if !UpdateRoom(2, room) {
		t.Error("error when update room")
	}
	colorlog.Debug("new room: %v", GetRoomByRoomId(1))
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

//////////////// message services

func TestGetMessagesByRoomId(t *testing.T) {
	data, _ := GetMessagesByRoomId(1, 10)
	for _, msg := range data {
		colorlog.Debug("msg result: %v", msg["username"])
	}
}

func TestInsertMessage(t *testing.T) {
	msg := Message{
		MessageType: common.TEXT,
		Content:     "unit test",
		FromId:      1,
		ToId:        0,
		RoomId:      6,
	}
	if !InsertMessage(msg) {
		t.Errorf("error insert message")
	}
}
