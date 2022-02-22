package main

import (
	"fmt"

	_ "web3chat/database/mysql/services" // init database
	"web3chat/routers"
)

func main() {
	fmt.Println("hello web3chat")

	r := routers.Init()
	r.Run()
}
