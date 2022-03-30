package ws

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"
	"web3chat/database/mysql/services"
	"web3chat/handlers/common"

	"github.com/yezihack/colorlog"
)

const (
	TuringUrl       = "http://openapi.turingapi.com/openapi/api/v2"
	TuringApi       = "e72a4a68d85949f6830775b71648da07"
	TuringUserId    = "coldplay"
	PostContentType = "application/json;charset=utf-8"
)

type InputText_ struct {
	Text string `json:"text"`
}

type InputImage_ struct {
	Url string `json:"url"`
}

type Location_ struct {
	City     string `json:"city"`
	Province string `json:"province"`
	Street   string `json:"street"`
}

type SelfInfo_ struct {
	Location Location_ `json:"location"`
}

type Perception_ struct {
	InputText InputText_ `json:"inputText"`
	// InputImage InputImage_ `json:"inputImage"`
	// SelfInfo   SelfInfo_   `json:"selfInfo"`
}

type UserInfo_ struct {
	ApiKey string `json:"apiKey"`
	UserId string `json:"userId"`
}

// http://openapi.turingapi.com/openapi/api/v2
type Request struct {
	ReqType    int         `json:"reqType"`
	Perception Perception_ `json:"perception"`
	UserInfo   UserInfo_   `json:"userInfo"`
}

type Parameters_ struct {
	NearbyPlace string `json:"nearby_place"`
}

type Intent_ struct {
	Code       int         `json:"code"`
	IntentName string      `json:"intentName"`
	ActionName string      `json:"actionName"`
	Parameters Parameters_ `json:"parameters"`
}

type Values_ struct {
	Url  string `json:"url"`
	Text string `json:"text"`
}

type Result struct {
	GroupType  int     `json:"groupType"`
	ResultType string  `json:"resultType"`
	Values     Values_ `json:"values"`
}

type Response struct {
	Intent  Intent_  `json:"intent"`
	Results []Result `json:"results"`
}

type Robot struct {
	// RoomName  string   // which room's robot, Hub has this info
	InputChan chan Msg // msg channel
	Name      string   // name of robot
	RobotId   uint64   // robot's id
	Hub       *Hub     // hub
}

// write a robot here to chat with `!`started message
func NewRobot(name string, hub *Hub) *Robot {
	// colorlog.Info("Enter `EOF` to shut down:")
	inputChan := make(chan Msg)
	userRobot := services.GetUserByUsername("robot_" + name)
	if userRobot.UserId == 0 {
		// register robot
		if !services.InsertUser(services.User{
			Address:  "robot_" + name,
			Username: "robot_" + name,
		}) {
			colorlog.Error("register robot failed")
			return nil
		}
		userRobot = services.GetUserByUsername("robot_" + name)
	}
	robot := &Robot{
		InputChan: inputChan,
		Name:      userRobot.Username,
		RobotId:   userRobot.UserId,
		Hub:       hub,
	}
	go robot.Process()
	return robot
}

func HandleError(err error) {
	if err != nil {
		colorlog.Error("error happended: %s", err.Error())
		panic("exit for error")
	}
}

// bot process the !started message from user
// TOFIX: the robot message will occupy the message of user's
func (robot *Robot) Process() {
	for {
		msg := <-robot.InputChan
		// colorlog.Info("received from command: %s", input)
		request := Request{
			ReqType:    0,
			Perception: Perception_{InputText: InputText_{Text: msg.Message.Content[1:]}},
			UserInfo:   UserInfo_{ApiKey: TuringApi, UserId: TuringUserId},
		}
		requestBytes, err := json.Marshal(request)
		colorlog.Info("robot received your message: %s", string(requestBytes))
		HandleError(err)
		res, err := http.Post(TuringUrl, PostContentType, bytes.NewBuffer([]byte(requestBytes)))
		HandleError(err)
		content, err := ioutil.ReadAll(res.Body)
		HandleError(err)
		var response Response
		err = json.Unmarshal(content, &response)
		HandleError(err)
		message := services.Message{
			MessageType: common.ROBOT,
			Content:     response.Results[0].Values.Text,
			FromId:      robot.RobotId,
			RoomId:      robot.Hub.roomId,
			ToId:        msg.Message.FromId,
		}
		time.Sleep(time.Second * 1) // wait one second
		if !services.InsertMessage(message) {
			colorlog.Error("insert message failed")
			continue
		}
		// colorlog.Info("Turing Bot: %v", response)
		message.CreatedAt = time.Now()
		robot.Hub.broadcast <- Msg{
			MessageType: common.ROBOT,
			Message:     message,
			User: services.User{
				UserId:   robot.RobotId,
				Username: robot.Name,
			},
		}
	}
}
