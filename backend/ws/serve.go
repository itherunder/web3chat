package ws

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

var hubs map[string]*Hub

func init() {
	colorlog.Info("init ws server hub")
	hubs = make(map[string]*Hub)
}

// serve a ws client
func ServeWs(c *gin.Context) bool {
	return serveWs(c)
}

func CountOnlineUsers() int {
	cnt := 0
	for _, hub := range hubs {
		cnt += len(hub.clients)
	}
	return cnt
}

func CountOnlineUsersByRoomName(roomName string) int {
	roomName = strings.ToLower(roomName)
	if hub, ok := hubs[roomName]; ok {
		return len(hub.clients)
	}
	return 0
}

func GetOnlineUsersListByRoomName(roomName string) []string {
	var users []string
	roomName = strings.ToLower(roomName)
	for client := range hubs[roomName].clients {
		users = append(users, client.ToString())
	}
	return users
}
