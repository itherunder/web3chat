package ws

import "github.com/yezihack/colorlog"

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	// clients map[*Client]bool
	// user id => client
	clients map[uint64]*Client

	// Inbound messages from the clients.
	broadcast chan Msg

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan Msg),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uint64]*Client),
	}
}

func (h *Hub) run() {
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
