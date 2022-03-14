package middleware

import (
	"net/http"
	"strconv"
	"strings"
	"time"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		var responseStatus common.ResponseStatus
		responseStatus.UserType = common.USER

		if tokenString == "" || !strings.HasPrefix(tokenString, "Bearer ") {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no permission"
			c.AbortWithStatusJSON(http.StatusOK, gin.H{"status": responseStatus})
			return
		}

		tokenString = tokenString[7:]
		token, claims, err := common.ParseToken(tokenString)
		if err != nil || !token.Valid {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no permission"
			c.AbortWithStatusJSON(http.StatusOK, gin.H{"status": responseStatus})
			return
		}

		user := services.GetUserByUserId(claims.UserId)
		if user.UserId == 0 {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "no such user: " + strconv.FormatUint(claims.UserId, 10)
			c.AbortWithStatusJSON(http.StatusOK, gin.H{"status": responseStatus})
			return
		}

		if claims.ExpiresAt < time.Now().Unix() {
			responseStatus.Status = common.StatusError
			responseStatus.ExtraMsg = "jwt token expired"
			c.AbortWithStatusJSON(http.StatusOK, gin.H{"status": responseStatus})
		}

		c.Set("user", user)
		c.Next()
	}
}
