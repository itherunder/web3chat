package ws

import (
	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

// var hubs map[string]*Hub // room name to hub
var hubs map[uint64]*Hub // room id to hub

func init() {
	colorlog.Info("init ws server hub")
	// hubs = make(map[string]*Hub)
	hubs = make(map[uint64]*Hub)
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

// // TODO: fix when page refresh, online users count will be more than real
// // the reason may be when closed the conn, hub will be wait for a while
// func CountOnlineUsersByRoomName(roomName string) int {
// 	roomName = strings.ToLower(roomName)
// 	colorlog.Debug("online user in %s", roomName)
// 	colorlog.Debug("hubs[%s] is %v", roomName, hubs[roomName])
// 	if hub, ok := hubs[roomName]; ok {
// 		return len(hub.clients)
// 	}
// 	return 1
// }

func CountOnlineUsersByRoomId(roomId uint64) int {
	colorlog.Debug("online user in %d", roomId)
	colorlog.Debug("hubs[%d] is %v", roomId, hubs[roomId])
	if hub_, ok := hubs[roomId]; ok {
		return len(hub_.clients)
	}
	return 1
}

// func GetOnlineUsersListByRoomName(roomName string) []string {
// 	var users []string
// 	roomName = strings.ToLower(roomName)
// 	for _, client := range hubs[roomName].clients {
// 		users = append(users, client.ToString())
// 	}
// 	return users
// }

func GetOnlineUsersListByRoomId(roomId uint64) []string {
	var users []string
	for _, client := range hubs[roomId].clients {
		users = append(users, client.ToString())
	}
	return users
}
