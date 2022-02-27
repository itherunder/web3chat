package ws

import (
	"net/http"

	"github.com/yezihack/colorlog"
)

var hub *Hub

func init() {
	colorlog.Info("init ws server hub")
	hub = newHub()
	go hub.run()
}

// serve a ws client
func ServeWs(w http.ResponseWriter, r *http.Request) {
	serveWs(hub, w, r)
}
