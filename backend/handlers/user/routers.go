package user

import (
	"net/http"
	"strings"
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
		c.JSON(http.StatusOK, gin.H{
			"data": responseStatus,
			"user": user,
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
			// responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "no such user"
			if !services.InsertUser(services.User{Address: address, Username: address}) {
				responseStatus.ExtraMsg += " => insert error"
			} else {
				responseStatus.ExtraMsg += " => insert success"
			}
		}
		responseStatus.Status = common.OK
		// return user to front
		user = services.GetUserByAddress(address)
		c.JSON(http.StatusOK, gin.H{
			"data": responseStatus,
			"user": user,
		})
	})

	e.GET("/api/user/getNonce", func(c *gin.Context) {
		address := strings.ToLower(c.Query("address"))
		colorlog.Debug(address)
		nonce := common.GenerateRandomNonce(address)
		c.JSON(http.StatusOK, gin.H{
			"status": "ok", "data": nonce,
		})
	})

	// sign a signature and send a jwt
	e.POST("/api/user/sign", func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		address := strings.ToLower(json["address"])
		signature := json["signature"]
		colorlog.Debug(address, signature)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		message := "I am signing my one-time nonce: " + common.GetNonceGenerated(address)
		if !common.ValidateSignature(message, address, signature) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "invalid signature, please resign!"
			c.JSON(http.StatusForbidden, gin.H{"data": responseStatus})
			return
		}
		// signature is right and send a jwt token to front
		user := services.GetUserByAddress(address)
		if token, err := common.ReleaseToken(user.UserId); err != nil {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "generate jwt token error: " + err.Error()
			c.JSON(http.StatusInternalServerError, gin.H{"data": responseStatus})
		} else {
			responseStatus.Status = common.OK
			responseStatus.ExtraMsg = "generate jwt token success"
			c.JSON(http.StatusOK, gin.H{"data": responseStatus, "token": token})
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
		responseStatus.Status = common.OK
		// return user to front
		c.JSON(http.StatusOK, gin.H{"data": responseStatus, "user": user})
	})

	// get profile of user, address/username/owned_chat/joined_chat/bio
	e.POST("/api/user/profile", middleware.AuthMiddleware(), func(c *gin.Context) {
		obj, _ := c.Get("user")
		user := obj.(services.User)
		ownedRooms := services.GetRoomByOnwer(user.UserId)
		var responseStatus common.ResponseStatus
		responseStatus.Status = common.OK
		responseStatus.UserType = common.USER
		c.JSON(http.StatusOK, gin.H{
			"data":        responseStatus,
			"user":        user,
			"owned_rooms": ownedRooms,
		})
	})

	// check the username is free or not
	e.GET("/api/user/checkUsername", middleware.AuthMiddleware(), func(c *gin.Context) {
		username := c.Query("username")
		user := services.GetUserByUsername(username)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		responseStatus.Status = common.OK
		c.JSON(http.StatusOK, gin.H{
			"data":   responseStatus,
			"user":   user,
			"result": user.UserId == 0,
		})
	})

	// need authorization with jwt, middleware have stored user, key is `user`
	e.POST("/api/user/updateProfile", middleware.AuthMiddleware(), func(c *gin.Context) {
		json := common.GetPostDataMap(c)
		address := strings.ToLower(json["address"])
		obj, _ := c.Get("user")
		user := obj.(services.User)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if user.Address != address { // update user not the jwt authorized user
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "no permission, update user not the jwt authorized user"
			c.JSON(http.StatusOK, gin.H{"data": responseStatus, "user": user})
			return
		}
		responseStatus.Status = common.OK
		// only update username
		// todo update more info...
		user.Username = json["username"]
		if !services.UpdateUser(user.UserId, user) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "services.UpdateUser error"
		}
		// return updated user to front
		c.JSON(http.StatusOK, gin.H{"data": responseStatus, "user": user})
	})
}
