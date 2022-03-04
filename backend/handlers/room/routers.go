package room

import (
	"net/http"
	"strings"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"
	middleware "web3chat/middlewares"
	"web3chat/ws"

	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

func Routers(e *gin.Engine) {
	// search the room is free or not
	e.GET("/api/room/search", middleware.AuthMiddleware(), func(c *gin.Context) {
		roomName := c.Query("roomName")
		room := services.GetRoomByRoomName(roomName)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		responseStatus.Status = common.OK
		c.JSON(http.StatusOK, gin.H{
			"data":   responseStatus,
			"room":   room,
			"result": room.RoomId != 0,
		})
	})

	// sign create room message
	e.POST("/api/room/signCreateMessage", middleware.AuthMiddleware(), func(c *gin.Context) {
		var responseStatus common.ResponseStatus
		json := common.GetPostDataMap(c)
		address := strings.ToLower(json["address"])
		roomName := strings.ToLower(json["room_name"])
		signature := json["signature"]
		message := "I am creating room: " + roomName
		if !common.ValidateSignature(message, address, signature) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "error signature, please check"
			c.JSON(http.StatusBadRequest, gin.H{"data": responseStatus})
			return
		}
		responseStatus.Status = common.OK
		responseStatus.UserType = common.USER
		responseStatus.ExtraMsg = "right signature! u can create room now!"
		c.JSON(http.StatusOK, gin.H{"data": responseStatus})
	})

	// create the room
	e.POST("/api/room/create", middleware.AuthMiddleware(), func(c *gin.Context) {
		var responseStatus common.ResponseStatus
		json := common.GetPostDataMap(c)
		roomName := strings.ToLower(json["room_name"])
		address := strings.ToLower(json["address"])
		obj, _ := c.Get("user")
		user := obj.(services.User)
		if user.Address != address {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "no perimission, post address is not the jwt uesr"
			c.JSON(http.StatusBadRequest, gin.H{"data": responseStatus})
			return
		}
		room := services.GetRoomByRoomName(roomName)
		// room has existed
		if room.RoomId != 0 {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "room has existed"
			c.JSON(http.StatusBadRequest, gin.H{"data": responseStatus})
			return
		}
		// no such room, can create
		responseStatus.UserType = common.USER
		room.RoomName = roomName
		room.OwnerId = user.UserId
		// create error
		if !services.InsertRoom(room) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "room create error"
			c.JSON(http.StatusBadRequest, gin.H{"data": responseStatus})
			return
		}
		responseStatus.Status = common.OK
		c.JSON(http.StatusOK, gin.H{
			"data": responseStatus,
			"room": room,
		})
	})

	// get current room
	// todo: connect user and room, is the user joined this room?
	e.GET("/api/room/currentRoom", middleware.AuthMiddleware(), func(c *gin.Context) {
		// user := c.Get("user")
		roomName := strings.ToLower(c.Query("roomName"))
		room := services.GetRoomByRoomName(roomName)
		var responseStatus common.ResponseStatus
		// finded
		if room.RoomId == 0 {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "no such room " + roomName
			c.JSON(http.StatusBadRequest, gin.H{"data": responseStatus})
			return
		}
		responseStatus.Status = common.OK
		messages, _ := services.GetMessagesByRoomId(room.RoomId, 50)
		c.JSON(http.StatusOK, gin.H{"data": responseStatus, "room": room, "messages": messages})
	})

	// handle websocket
	// e.GET("/ws", middleware.AuthMiddleware(), func(c *gin.Context) {
	e.GET("/ws", func(c *gin.Context) {
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		colorlog.Debug("request for websocket")
		if !ws.ServeWs(c) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "error when serve ws, refresh page please"
			c.JSON(http.StatusInternalServerError, gin.H{"data": responseStatus})
		}
		responseStatus.Status = common.OK
		// c.JSON(http.StatusOK, gin.H{"data": responseStatus})
	})
}
