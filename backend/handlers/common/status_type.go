package common

type UserType string
type ResponseStatusType string

const (
	USER  UserType = "user"
	GUEST UserType = "guest"
	ADMIN UserType = "admin"
)

const (
	StatusOk    ResponseStatusType = "ok"
	StatusError ResponseStatusType = "error"
)

type ResponseStatus struct {
	Status   ResponseStatusType `json:"status"`
	UserType UserType           `json:"user_type"`
	ExtraMsg string             `json:"extra_msg"`
}
