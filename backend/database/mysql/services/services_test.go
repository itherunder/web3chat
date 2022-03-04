package services

import (
	"encoding/json"
	"fmt"
	"testing"
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
