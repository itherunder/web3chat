package common

import (
	"testing"
)

func TestValidateSignature(t *testing.T) {
	// nonce is from redis
	address := "0x3bb53e81d7b9bd6369ad84d7289b2b42fb486120"
	sig := "0x73fd4dfeb9e24e37de93164d93b8f15a1859a41968e5b97cabac188bcbed85105f9c24d70457fa9962407ae83ed9b50084087df445f59503e8d3e8302506b7c61c"
	message := "I am signing my one-time nonce: " + GetNonceGenerated(address)
	if !ValidateSignature(message, address, sig) {
		t.Error("error signature")
	}
}
