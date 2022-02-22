package user

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"web3chat/database/redis"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// generate a random nonce for user sign
// store the address and its nonce into the redis
// set expires time for this address & nonce
func GenerateRandomNonce(address string) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	nonce := strconv.FormatInt(int64(r.Intn(10000)), 10)
	key := address + "_nonce"
	redis.RedisDbInstance().SET(key, nonce)
	return nonce
}

// get nonce by user address
func GetNonceGenerated(address string) string {
	key := address + "_nonce"
	if nonce, err := redis.RedisDbInstance().GET(key); err != nil {
		return ""
	} else {
		return nonce
	}
}

func ValidateSignature(address, sigHex string) bool {
	fromAddr := common.HexToAddress(address)

	sig := hexutil.MustDecode(sigHex)
	if sig[64] != 27 && sig[64] != 28 {
		return false
	}
	sig[64] -= 27
	nonce, err := redis.RedisDbInstance().GET(address + "_nonce")
	if err != nil {
		fmt.Println("error no address's nonce")
		return false
	}

	pubKey, err := crypto.SigToPub(signHash([]byte("I am signing my one-time nonce: "+nonce)), sig)
	if err != nil {
		fmt.Println("error when crypto.SigToPub")
		return false
	}

	recoveredAddr := crypto.PubkeyToAddress(*pubKey)
	return fromAddr == recoveredAddr
}

func signHash(data []byte) []byte {
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(data), data)
	return crypto.Keccak256([]byte(msg))
}
