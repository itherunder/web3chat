package main

import (
	_ "web3chat/database/mysql/services" // init database
	"web3chat/routers"

	"github.com/yezihack/colorlog"
)

func main() {
	colorlog.Info("hello web3chat")

	r := routers.Init()
	r.Run()
}
