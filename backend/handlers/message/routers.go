package message

import (
	"net/http"
	"strconv"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"
	middleware "web3chat/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

func Routers(e *gin.Engine) {
	// return the latest 50? of the room
	e.GET("/api/message/latest", middleware.AuthMiddleware(), func(c *gin.Context) {
		roomId, _ := strconv.ParseUint(c.Query("roomId"), 10, 64)
		colorlog.Debug("get roomid: %v's messages", roomId)
		var responseStatus common.ResponseStatus
		if messages, ok := services.GetMessagesByRoomId(roomId, 50); ok {
			responseStatus.Status = common.StatusOK
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": messages})
		} else {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "get latest messages error"
			// c.JSON(http.StatusInternalServerError, gin.H{"status": responseStatus})
			c.JSON(http.StatusOK, gin.H{"status": responseStatus})
		}
	})
}
