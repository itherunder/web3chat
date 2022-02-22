package common

import "encoding/json"

type UserType string
type ResponseStatusType string
type PostStatusType int

const (
	OPENING    PostStatusType = 1
	PROCESSING PostStatusType = 2
	CLOSED     PostStatusType = 3
	DELETED    PostStatusType = 4
)

func (x PostStatusType) String() string {
	switch x {
	case OPENING:
		return "OPENING"
	case PROCESSING:
		return "PROCESSING"
	case CLOSED:
		return "CLOSED"
	case DELETED:
		return "DELETED"
	default:
		return "UNKNOWN"
	}
}

func (x PostStatusType) Int() int {
	switch x {
	case OPENING:
		return 1
	case PROCESSING:
		return 2
	case CLOSED:
		return 3
	case DELETED:
		return 4
	default:
		return -1
	}
}

const (
	USER  UserType = "user"
	GUEST UserType = "guest"
	ADMIN UserType = "admin"
)

const (
	OK    ResponseStatusType = "ok"
	ERROR ResponseStatusType = "error"
)

func (x UserType) String() string {
	switch x {
	case USER:
		return "user"
	case GUEST:
		return "guest"
	case ADMIN:
		return "admin"
	default:
		return "unknown"
	}
}

func (x ResponseStatusType) String() string {
	switch x {
	case OK:
		return "ok"
	case ERROR:
		return "error"
	default:
		return "unknown"
	}
}

type ResponseStatus struct {
	Status   ResponseStatusType `json:"status"`
	UserType UserType           `json:"user_type"`
	ExtraMsg string             `json:"extra_msg"`
}

func (s ResponseStatus) String() string {
	if data, err := json.Marshal(s); err != nil {
		return err.Error()
	} else {
		return string(data)
	}
}
