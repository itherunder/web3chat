package ws

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/yezihack/colorlog"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Msg struct {
	MessageType common.MessageType `json:"message_type"`
	Message     services.Message   `json:"message"`
	User        services.User      `json:"user"`
}

// Msg to bytes
func (msg Msg) ToBytes() []byte {
	if bytesMsg, err := json.Marshal(msg); err != nil {
		colorlog.Error("Marshal msg error: %v", err)
		return []byte("")
	} else {
		return bytesMsg
	}
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	userId   uint64
	userName string
	hub      *Hub
	conn     *websocket.Conn
	send     chan Msg
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, bytesMessage, err := c.conn.ReadMessage()
		colorlog.Debug("read msg: %v", string(bytesMessage))
		var msg Msg
		if err := json.Unmarshal(bytesMessage, &msg); err != nil {
			colorlog.Error("unmarshal error: %v", err)
			return
		}
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				colorlog.Error("error: %v", err)
			}
			break
		}
		c.hub.broadcast <- msg
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(msg.ToBytes())

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write((<-c.send).ToBytes())
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(c *gin.Context) bool {
	roomName := c.Query("roomName")
	// todo: when connect with ws, send token from front, done
	obj, _ := c.Get("user")
	user, _ := obj.(services.User)
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		colorlog.Error("err %v", err)
		return false
	}
	if _, ok := hubs[roomName]; !ok {
		hubs[roomName] = newHub()
		hubs[roomName].run()
	}
	client := &Client{userId: user.UserId, userName: user.Username, hub: hubs[roomName], conn: conn, send: make(chan Msg, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
	return true
}

func (client *Client) ToString() string {
	return fmt.Sprintf("%s#%d", client.userName, client.userId)
}
