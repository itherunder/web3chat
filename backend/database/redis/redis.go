package redis

import (
	"github.com/garyburd/redigo/redis"
)

var redisDb *RedisDb

type RedisDb struct {
	conn redis.Conn
}

func init() {
	redisDb, _ = CreateConn()
}
func RedisDbInstance() *RedisDb {
	return redisDb
}

func CreateConn() (*RedisDb, error) {
	// redis no password
	// if conn, err := redis.Dial("tcp", "127.0.0.1:6379", redis.DialPassword("123456")); err != nil {
	if conn, err := redis.Dial("tcp", "127.0.0.1:6379", redis.DialPassword("")); err != nil {
		return nil, err
	} else {
		return &RedisDb{conn: conn}, err
	}
}

func (r *RedisDb) PutHash(hashName, key, value string) (string, error) {
	return redis.String(r.conn.Do("HSET", hashName, key, value))
}

func (r *RedisDb) GetHash(hashName, key string) (string, error) {
	return redis.String(r.conn.Do("HGET", hashName, key))
}

func (r *RedisDb) SET(key, value string) (string, error) {
	return redis.String(r.conn.Do("SET", key, value))
}

func (r *RedisDb) GET(key string) (string, error) {
	return redis.String(r.conn.Do("GET", key))
}

func (r *RedisDb) SetExpire(key string, time int) (bool, error) {
	return redis.Bool(r.conn.Do("EXPIRE", key, time))
}

func (r *RedisDb) PutSet(hashName, value string) (string, error) {
	return redis.String(r.conn.Do("SADD", hashName, value))
}

func (r *RedisDb) GetSet(hashName, value string) ([]interface{}, error) {
	if s, err := r.conn.Do("SMEMBERS", hashName); err != nil {
		return nil, err
	} else {
		return s.([]interface{}), err
	}
}
