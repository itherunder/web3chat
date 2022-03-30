package ws

import (
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	// clients map[*Client]bool
	// user id => client
	clients    map[uint64]*Client
	broadcast  chan Msg     // Inbound messages from the clients.
	register   chan *Client // Register requests from the clients.
	unregister chan *Client // Unregister requests from clients.
	roomName   string       // Room name
	roomId     uint64       // Room id
}

func newHub(roomName string, roomId uint64) *Hub {
	return &Hub{
		broadcast:  make(chan Msg),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uint64]*Client),
		roomName:   roomName,
		roomId:     roomId,
	}
}

// TODO: insert robot message into MySQL
func (h *Hub) run() {
	robot := NewRobot("turing", h)
	colorlog.Info("start robot %s", robot.Name)
	for {
		select {
		case client := <-h.register:
			colorlog.Debug("new client connect: %s", client.ToString())
			h.clients[client.userId] = client
		case client := <-h.unregister:
			colorlog.Debug("client disconnect: %s", client.ToString())
			if _, ok := h.clients[client.userId]; ok {
				delete(h.clients, client.userId)
				close(client.send)
			}
		case msg := <-h.broadcast:
			colorlog.Debug("broadcast msg: %v", msg)
			if msg.Message.Content[0] == '!' && msg.MessageType != common.ROBOT {
				robot.InputChan <- msg
			}
			for userId, client := range h.clients {
				select {
				case client.send <- msg:
				default:
					close(client.send)
					delete(h.clients, userId)
				}
			}
		}
	}
}
