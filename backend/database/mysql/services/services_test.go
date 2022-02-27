package services

import (
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
