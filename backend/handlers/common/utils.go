package common

import (
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
	"web3chat/database/redis"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"github.com/yezihack/colorlog"
	"gorm.io/gorm"
)

func CheckDbError(d *gorm.DB) bool {
	if d != nil && d.Error != nil {
		colorlog.Error("%v", d.Error)
		return false
	}
	return true
}

// get post data from json format
// TODO: change type from map[string]string => map[string]interface{}
func GetPostDataMap(c *gin.Context) map[string]string {
	json := make(map[string]string)
	c.BindJSON(&json)
	return json
}

func ValidateSignature(message string, address, sigHex string) bool {
	fromAddr := common.HexToAddress(address)

	sig := hexutil.MustDecode(sigHex)
	if sig[64] != 27 && sig[64] != 28 {
		return false
	}
	sig[64] -= 27

	colorlog.Debug("message to sign: `%s`", message)
	pubKey, err := crypto.SigToPub(signHash([]byte(message)), sig)
	if err != nil {
		colorlog.Error("error when crypto.SigToPub")
		return false
	}

	recoveredAddr := crypto.PubkeyToAddress(*pubKey)
	return fromAddr == recoveredAddr
}

func signHash(data []byte) []byte {
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(data), data)
	return crypto.Keccak256([]byte(msg))
}

// generate a random nonce for user sign
// store the address and its nonce into the redis
// set expires time for this address & nonce
func GenerateRandomNonce(address string) string {
	address = strings.ToLower(address)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	nonce := strconv.FormatInt(int64(r.Intn(10000)), 10)
	key := address + "_nonce"
	if _, err := redis.RedisDbInstance().SET(key, nonce); err != nil {
		colorlog.Error("err when set nonce %s by redis %s", nonce, address)
	}
	return nonce
}

// get nonce by user address
func GetNonceGenerated(address string) string {
	key := address + "_nonce"
	if nonce, err := redis.RedisDbInstance().GET(key); err != nil {
		colorlog.Error("get nonce by redis error: %s", err.Error())
		return ""
	} else {
		return nonce
	}
}
