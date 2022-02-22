package user

import (
	"fmt"
	"net/http"
	"strings"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"
	middleware "web3chat/middlewares"

	"github.com/gin-gonic/gin"
)

func Routers(e *gin.Engine) {
	e.GET("/api/user/currentUesr", func(c *gin.Context) {
		address := strings.ToLower(c.Query("address"))
		fmt.Println(address)
		if address == "0x3bb53e81d7b9bd6369ad84d7289b2b42fb486120" {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok", "result": "admin",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "ok", "result": "user",
			})
		}
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
			if !services.InsertUser(services.User{Address: address}) {
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
		fmt.Println(address)
		nonce := GenerateRandomNonce(address)
		c.JSON(http.StatusOK, gin.H{
			"status": "ok", "data": nonce,
		})
	})

	// sign a signature and send a jwt
	e.POST("/api/user/sign", func(c *gin.Context) {
		address := strings.ToLower(c.PostForm("address"))
		signature := c.PostForm("signature")
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		if !ValidateSignature(address, signature) {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "invalid signature, please resign!"
			c.JSON(http.StatusOK, gin.H{"data": responseStatus})
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

	// need authorization with jwt
	e.POST("/api/user/login", middleware.AuthMiddleware(), func(c *gin.Context) {
		address := strings.ToLower(c.PostForm("address"))
		user := services.GetUserByAddress(address)
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER
		// if no such user, jwt error something
		if user.UserId == 0 {
			responseStatus.Status = common.ERROR
			responseStatus.ExtraMsg = "no such user"
		} else {
			responseStatus.Status = common.OK
		}
		// return user to front
		c.JSON(http.StatusOK, gin.H{"data": responseStatus, "user": user})
	})
}
