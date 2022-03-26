package main

import (
	_ "web3chat/database/mysql/services" // init database
	"web3chat/routers"
	_ "web3chat/ws" // init ws server

	"github.com/yezihack/colorlog"
)

// TODO: add config control object with Viper
func main() {
	colorlog.Info("hello web3chat")

	r := routers.Init()
	r.Run()
}
