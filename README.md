# web3chat
web3聊天室

## 依赖
go get github.com/ethereum/go-ethereum
go get github.com/jinzhu/gorm
go get github.com/garyburd/redigo
go get github.com/spf13/viper

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

type Message struct {
	MessageId   uint64             `gorm:"column:message_id;type:bigint(20) unsigned not null auto_increment primary key" json:"message_id"`
	MessageType common.MessageType `gorm:"column:message_type;type:varchar(10) not null default 'TEXT'" json:"message_type"`
	Content     string             `gorm:"column:content;type:text not null" json:"content"`
	FromId      uint64             `gorm:"column:from_id;type:bigint(20) unsigned not null" json:"from_id"`
	ToId        uint64             `gorm:"column:to_id;type:bigint(20) unsigned not null default 0" json:"to_id"`
	RoomId      uint64             `gorm:"column:room_id;type:bigint(20) unsigned not null default 0" json:"room_id"`
	CreatedAt   time.Time          `gorm:"column:created_at;type:timestamp null default now()" json:"created_at"`
	ModifiedAt  time.Time          `gorm:"column:modified_at;type:timestamp null" json:"modified_at"`
}
```

2. room
```Golang
var room_id uint64
var room_name string
var created_at uint64
var is_deleted bool
var owner string
var description string

type Room struct {
	RoomId      uint64    `gorm:"column:room_id;type:bigint(20) unsigned not null auto_increment primary key" json:"room_id"`
	RoomName    string    `gorm:"column:room_name;type:varchar(40) unique not null" json:"room_name"`
	Description string    `gorm:"column:description;type:varchar(80) not null" json:"description"`
	OwnerId     uint64    `gorm:"column:owner_id;type:bigint(20) unsigned not null" json:"owner_id"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamp null default now()" json:"created_at"`
	UsersCount  int       `gorm:"column:users_count;type:int not null default 0" json:"users_count"`
	IsDeleted   bool      `gorm:"column:is_deleted;type:boolean not null default false" json:"is_deleted"`
}
```

3. user
```Golang
var user_id uint64
var user_name string
var alias string // ens...
var created_at uint64
var is_deleted bool
var room_ids []uint64

type User struct {
	UserId    uint64    `gorm:"column:user_id;type:bigint(20) unsigned not null auto_increment primary key" json:"user_id"`
	Address   string    `gorm:"column:address;type:varchar(60) unique not null default ''" json:"address"`
	Username  string    `gorm:"column:username;type:varchar(60) unique not null default ''" json:"username"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp default now()" json:"created_at"`
	IsDeleted bool      `gorm:"column:is_deleted;type:bool not null default false" json:"is_deleted"`
	Rooms     string    `gorm:"column:rooms;type:text" json:"rooms"`
	Bio       string    `gorm:"column:bio;type:varchar(60) not null default 'Hello Web3chat'" json:"bio"`
}
```

## 22.2.20
![metamask登录流程](pic/metamask登录流程.png)
metamask登录流程：
1. 后端生成一个随机数nonce
2. 前端链接metamask钱包并签名该nonce
3. 后端收到该nonce的签名
4. 发一个session_id，并且在redis设置该id的有效时间，每次交互的时候验证是否过期吧
TODO: 然后怎么搞呢？应该是发一个session（jwt）保持连接？然后定期更换nonce并重新签名？


## 22.2.21
后端的统一response结构为
```Golang
gin.H{
    "status": {
        "status": ...,
        "user_type": ...,
        "extra_msg": ...,
    }
    "data": ...,
}
```