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

type Preception_ struct {
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
	Preception Preception_ `json:"preception"`
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
	InputChan chan Msg // msg channel
	RoomName  string   // which room's robot
	Name      string   // name of robot
	RobotId   uint64   // robot's id
	Hub       *Hub     // hub
}

// write a robot here to chat with `!`started message
func NewRobot(roomName string, name string, hub *Hub) *Robot {
	// colorlog.Info("Enter `EOF` to shut down:")
	inputChan := make(chan Msg)
	robot := &Robot{
		InputChan: inputChan,
		RoomName:  roomName,
		Name:      name,
		RobotId:   9999, // TODO: robot id
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

// bot process the cmd input
func (robot *Robot) Process() {
	for {
		msg := <-robot.InputChan
		// colorlog.Info("received from command: %s", input)
		request := Request{
			ReqType:    0,
			Preception: Preception_{InputText: InputText_{Text: msg.Message.Content}},
			UserInfo:   UserInfo_{ApiKey: TuringApi, UserId: TuringUserId},
		}
		colorlog.Info("your message: %v", request)
		requestBytes, err := json.Marshal(request)
		HandleError(err)
		res, err := http.Post(TuringUrl, PostContentType, bytes.NewBuffer([]byte(requestBytes)))
		HandleError(err)
		content, err := ioutil.ReadAll(res.Body)
		HandleError(err)
		var response Response
		err = json.Unmarshal(content, &response)
		HandleError(err)
		// colorlog.Info("Turing Bot: %v", response)
		robot.Hub.broadcast <- Msg{
			MessageType: common.ROBOT,
			Message: services.Message{
				MessageId: 9999, // TODO: message id
				Content:   "AI: " + response.Results[0].Values.Text,
				CreatedAt: time.Now(),
				FromId:    robot.RobotId,
			},
			User: services.User{
				UserId:   robot.RobotId,
				Username: robot.Name,
			},
		}
	}
}
