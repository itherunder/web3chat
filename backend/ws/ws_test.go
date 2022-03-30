package ws

import (
	"testing"
)

func TestNewHubs(t *testing.T) {
	// hubs = make(map[string]*Hub)
	// hubs["2333"] = newHub("2333")
	hubs[2333] = newHub("2333", 2333)
}
