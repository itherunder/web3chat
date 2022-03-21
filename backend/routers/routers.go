package routers

import (
	"net/http"
	"web3chat/handlers/message"
	"web3chat/handlers/room"
	"web3chat/handlers/user"

	"github.com/gin-gonic/gin"
)

// func(*gin.Engine) is a router for get,post etc's request
type Option func(*gin.Engine)

var options []Option

func init() {
	include(user.Routers)
	include(room.Routers)
	include(message.Routers)
}

func include(opts ...Option) {
	options = append(options, opts...)
}

func Init() *gin.Engine {
	r := gin.New()
	for _, opt := range options {
		opt(r)
	}
	// add static dir
	r.StaticFS("/uploads", http.Dir("./uploads"))
	return r
}
