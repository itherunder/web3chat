package main

import (
	"fmt"

	_ "web3chat/database/mysql/services"
)

func main() {
	fmt.Println("hello web3chat")

	// r := gin.Default()
	// r.GET("/test", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "test",
	// 	})
	// })
	// r.Run()
}
