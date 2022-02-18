# web3chat
web3聊天室


## 22.2.18
今天打算做一个web3的聊天室，目前考虑的是这样的：
1. 和discord一样，聊天室有不同的名字，可以新建、删除（必须是owner），每个人只能建10个聊天室
2. 通过metamask登录，这个还不知道怎么做
3. 

### 技术路线：
1. 使用gin+react+websocket

### MySql建表
1. message
```Golang
var content string
var from_id string
var created_at uint64
var modified_at uint64
var room_id uint64

```

2. room
```Golang
var room_id uint64
var room_name string
var created_at uint64
var is_deleted bool
var owner string
var description string

```

3. user
```Golang
var user_id uint64
var user_name string
var alias string // ens...
var created_at uint64
var is_deleted bool
var room_ids []uint64

```