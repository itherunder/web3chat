package common

type UserType string
type ResponseStatusType string
type MessageType = string

const (
	USER  UserType = "user"
	GUEST UserType = "guest"
	ADMIN UserType = "admin"
)

const (
	StatusOK    ResponseStatusType = "ok"
	StatusError ResponseStatusType = "error"
)

// TODO: add messagetype to all message
const (
	TEXT      MessageType = "TEXT"
	LOGIN     MessageType = "LOGIN"
	LOGOUT    MessageType = "LOGOUT"
	PICTURE   MessageType = "PICTURE"
	REDPACKET MessageType = "REDPACKET"
	FILE      MessageType = "FILE"
	UNKNOWN   MessageType = "UNKNOWN"
	ROBOT     MessageType = "ROBOT"
)

type ResponseStatus struct {
	Status   ResponseStatusType `json:"status"`
	UserType UserType           `json:"user_type"`
	ExtraMsg string             `json:"extra_msg"`
}
