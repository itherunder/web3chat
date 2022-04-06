package middleware

import (
	"net/http"
	"strconv"
	"strings"
	"time"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"

	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
)

// TODO: decrease the mysql query time when every middleware run.
// TODO: just add a cache to do that
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
			if claims.ExpiresAt < time.Now().Unix() {
				responseStatus.Status = common.StatusExpired
			} else {
				responseStatus.Status = common.StatusError
			}
			responseStatus.ExtraMsg = "error when parse token " + err.Error()
			colorlog.Error("error when parse token, %v", err)
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

		c.Set("user", user)
		c.Next()
	}
}
