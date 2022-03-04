package ws

import (
	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

var hub *Hub

func init() {
	colorlog.Info("init ws server hub")
	hub = newHub()
	go hub.run()
}

// serve a ws client
func ServeWs(c *gin.Context) bool {
	return serveWs(hub, c)
}
