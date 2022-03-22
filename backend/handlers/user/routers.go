package user

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"
	middleware "web3chat/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

func Routers(e *gin.Engine) {
	e.POST("/api/user/currentUser", middleware.AuthMiddleware(), func(c *gin.Context) {
		obj, _ := c.Get("user")
		user := obj.(services.User)
		colorlog.Debug("current user: %v", user)
		var responseStatus common.ResponseStatus
		if user.Address == "0x3bb53e81d7b9bd6369ad84d7289b2b42fb486120" {
			responseStatus.UserType = common.ADMIN
		} else {
			responseStatus.UserType = common.USER
		}
		responseStatus.Status = common.StatusOK
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data":   user,
		})
		// if address == "0x3bb53e81d7b9bd6369ad84d7289b2b42fb486120" {
		// 	c.JSON(http.StatusOK, gin.H{
		// 		"status": "ok", "result": "admin",
		// 	})
		// } else {
		// 	c.JSON(http.StatusBadRequest, gin.H{
		// 		"status": "ok", "result": "user",
		// 	})
		// }
	})

	// if have this address then check the jwt
	// if not have, insert user into mysql
	e.GET("/api/user/signup", func(c *gin.Context) {
		address := strings.ToLower(c.Query("address"))
		user := services.GetUserByAddress(address)
		var responseStatus common.ResponseStatus
		// todo: user type need rewrite
		responseStatus.UserType = common.USER
		// no this address user, then insert it into mysql
		if user.UserId == 0 {
			// responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no such user"
			if !services.InsertUser(services.User{Address: address, Username: address}) {
				responseStatus.ExtraMsg += " => insert error"
			} else {
				responseStatus.ExtraMsg += " => insert success"
			}
		}
		responseStatus.Status = common.StatusOK
		// return user to front
		user = services.GetUserByAddress(address)
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data":   user,
		})
	})

	e.GET("/api/user/getNonce", func(c *gin.Context) {
		address := strings.ToLower(c.Query("address"))
		colorlog.Debug(address)
		nonce := common.GenerateRandomNonce(address)
		var responseStatus common.ResponseStatus
		responseStatus.Status = common.StatusOK
		responseStatus.UserType = common.USER
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus, "data": nonce,
		})
	})

	// sign a signature and send a jwt
	e.POST("/api/user/signLoginMessage", func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		colorlog.Debug("post /api/user/signLoginMessage: %v", json)
		address := strings.ToLower(json["address"])
		signature := json["signature"]
		colorlog.Debug(address, signature)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		message := "I am signing my one-time nonce: " + common.GetNonceGenerated(address)
		if !common.ValidateSignature(message, address, signature) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "invalid signature, please resign!"
			// c.JSON(http.StatusForbidden, gin.H{"status": responseStatus})
			c.JSON(http.StatusOK, gin.H{"status": responseStatus})
			return
		}
		// signature is right and send a jwt token to front
		user := services.GetUserByAddress(address)
		if token, err := common.ReleaseToken(user.UserId); err != nil {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "generate jwt token error: " + err.Error()
			// c.JSON(http.StatusInternalServerError, gin.H{"status": responseStatus})
			c.JSON(http.StatusOK, gin.H{"status": responseStatus})
		} else {
			responseStatus.Status = common.StatusOK
			responseStatus.ExtraMsg = "generate jwt token success"
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": token})
		}
	})

	// need authorization with jwt, middleware have stored user, key is `user`
	e.POST("/api/user/login", middleware.AuthMiddleware(), func(c *gin.Context) {
		// json := common.GetPostDataMap(c)
		// address := strings.ToLower(json["address"])
		// user := services.GetUserByAddress(address)
		obj, _ := c.Get("user")
		user := obj.(services.User)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		// if no such user, jwt error something
		responseStatus.Status = common.StatusOK
		// return user to front
		c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
	})

	// get profile of user, address/username/owned_chat/joined_chat/bio
	e.POST("/api/user/profile", middleware.AuthMiddleware(), func(c *gin.Context) {
		obj, _ := c.Get("user")
		user := obj.(services.User)
		json_ := common.GetPostDataMap(c)

		colorlog.Debug("user %s require user %s's profile", user.Username, json_["username"])
		if json_["username"] != user.Username {
			user = services.GetUserByUsername(json_["username"])
		}

		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER

		// ownedRooms := services.GetRoomsByOnwer(user.UserId)
		// var joinedRooms map[string]string
		// if err := json.Unmarshal([]byte(user.Rooms), &joinedRooms); err != nil {
		// 	colorlog.Error("unmarshal rooms error: ", err.Error())
		// 	responseStatus.Status = common.StatusError
		// 	responseStatus.ExtraMsg = "unmarshal rooms error: " + err.Error()
		// 	c.JSON(http.StatusOK, gin.H{
		// 		"status": responseStatus,
		// 		"data": map[string]interface{}{
		// 			"user":         user,
		// 			"joined_rooms": joinedRooms,
		// 		},
		// 	})
		// }
		responseStatus.Status = common.StatusOK
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data": map[string]interface{}{
				"user": user,
				// "joined_rooms": joinedRooms,
				// "owned_rooms":  ownedRooms,
			},
		})
	})

	// check the username is free or not
	e.GET("/api/user/checkUsername", middleware.AuthMiddleware(), func(c *gin.Context) {
		username := c.Query("username")
		user := services.GetUserByUsername(username)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		responseStatus.Status = common.StatusOK
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data": map[string]interface{}{
				"user":   user,
				"result": user.UserId == 0,
			},
		})
	})

	// need authorization with jwt, middleware have stored user, key is `user`
	e.POST("/api/user/updateProfile", middleware.AuthMiddleware(), func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		colorlog.Debug("post /api/user/updateProfile: %v", json)
		address := strings.ToLower(json["address"])
		obj, _ := c.Get("user")
		user := obj.(services.User)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if user.Address != address { // update user not the jwt authorized user
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no permission, update user not the jwt authorized user"
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
			return
		}
		responseStatus.Status = common.StatusOK
		// only update username
		// todo update more info...
		user.Username = json["username"]
		if !services.UpdateUser(user.UserId, user) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "services.UpdateUser error"
		}
		// return updated user to front
		c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
	})

	// send message
	e.POST("/api/user/sendMessage", middleware.AuthMiddleware(), func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		colorlog.Debug("post /api/user/sendMessage: %v", json)
		address := strings.ToLower(json["address"])
		obj, _ := c.Get("user")
		user := obj.(services.User)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if user.Address != address { // post user addr not the jwt authorized user addr
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no permission, send message user not the jwt authorized user"
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
			return
		}
		var message services.Message
		message.MessageType = common.MessageType(json["message_type"])
		message.Content = json["content"]
		message.FromId = user.UserId
		roomId, err := strconv.ParseUint(json["room_id"], 10, 64)
		if err != nil {
			colorlog.Error("error when parse roomid: %v", err)
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "error roomid"
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
			return
		}
		message.RoomId = roomId
		if !services.InsertMessage(message) {
			colorlog.Error("error when insert message")
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "error when insert message"
			c.JSON(http.StatusOK, gin.H{"status": responseStatus, "data": user})
			return
		}

		message.CreatedAt = time.Now()
		responseStatus.Status = common.StatusOK
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data": map[string]interface{}{
				"user":    user,
				"message": message,
			},
		})
	})

	e.POST("/api/user/openRedPacket", middleware.AuthMiddleware(), func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		obj, _ := c.Get("user")
		user, _ := obj.(services.User)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if !services.SetOpened(json, user) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "set opened error"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   false,
			})
		} else {
			responseStatus.Status = common.StatusOK
			responseStatus.ExtraMsg = "will be expired in one day"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   true,
			})
		}
	})

	e.POST("/api/user/upload", middleware.AuthMiddleware(), func(c *gin.Context) {
		// e.POST("/api/user/upload", func(c *gin.Context) {
		// c.Request.FormFile("file")
		file, err := c.FormFile("file")
		obj, _ := c.Get("user")
		user, _ := obj.(services.User)

		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if err != nil {
			colorlog.Error("error when upload file %s", err.Error())
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = err.Error()
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   "",
			})
			return
		}
		filename := fmt.Sprintf("%d_%d%s", user.UserId, time.Now().Unix(), path.Ext(file.Filename))
		// todo: change this hard encode to config with Viper
		filepath := path.Join("./uploads/" + filename)
		colorlog.Debug("upload file: %s", filename)
		if err = c.SaveUploadedFile(file, filepath); err != nil {
			colorlog.Error("error when save file %s", err.Error())
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = err.Error()
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   "",
			})
			return
		}
		responseStatus.Status = common.StatusOK
		responseStatus.ExtraMsg = filename
		c.JSON(http.StatusOK, gin.H{
			"status": responseStatus,
			"data":   filename,
		})
	})

	e.POST("/api/user/joinRoom", middleware.AuthMiddleware(), func(c *gin.Context) {
		obj, _ := c.Get("user")
		user, _ := obj.(services.User)
		json_ := common.GetPostDataMap(c)
		room_name := json_["room_name"]
		var rooms map[string]string
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if err := json.Unmarshal([]byte(user.Rooms), &rooms); err != nil {
			responseStatus.ExtraMsg = "error when unmarshal rooms"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}
		// most 100 rooms can join
		if len(rooms) >= 100 {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "you have joined 100 rooms"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}
		// todo, user role in rooms can be set
		rooms[room_name] = "user"
		rbytes, _ := json.Marshal(rooms)
		user.Rooms = string(rbytes)
		if !services.UpdateUser(user.UserId, user) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "update user error"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}

		// update room
		room := services.GetRoomByRoomName(room_name)
		room.UsersCount += 1
		if !services.UpdateRoom(room.RoomId, room) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "update room error"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}
	})

	e.POST("/api/user/exitRoom", middleware.AuthMiddleware(), func(c *gin.Context) {
		obj, _ := c.Get("user")
		user, _ := obj.(services.User)
		json_ := common.GetPostDataMap(c)
		room_name := json_["room_name"]
		var rooms map[string]string
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if err := json.Unmarshal([]byte(user.Rooms), &rooms); err != nil {
			responseStatus.ExtraMsg = "error when unmarshal rooms"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}
		delete(rooms, room_name)

		rbytes, _ := json.Marshal(rooms)
		user.Rooms = string(rbytes)
		if !services.UpdateUser(user.UserId, user) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "update user error"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}

		// update room
		room := services.GetRoomByRoomName(room_name)
		room.UsersCount -= 1
		if !services.UpdateRoom(room.RoomId, room) {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "update room error"
			c.JSON(http.StatusOK, gin.H{
				"status": responseStatus,
				"data":   rooms,
			})
			return
		}
	})
}
