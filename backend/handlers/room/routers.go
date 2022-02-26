package user

import (
	"net/http"
	"strings"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"
	middleware "web3chat/middlewares"

	"github.com/gin-gonic/gin"
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
			"result": room.RoomId == 0,
		})
	})

	e.POST("/api/room/signCreateMessage", middleware.AuthMiddleware(), func(c *gin.Context) {
		var responseStatus common.ResponseStatus
		json := common.GetPostDataMap(c)
		address := strings.ToLower(json["address"])
		roomName := strings.ToLower(json["roomName"])
		signature := json["signature"]
		message := "I am creating room: " + roomName
		if !common.ValidateSignature()
	})

	// create the room
	e.GET("/api/room/create", middleware.AuthMiddleware(), func(c *gin.Context) {
		var responseStatus common.ResponseStatus
		json := common.GetPostDataMap(c)
		roomName := strings.ToLower(json["roomName"])
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
}
