// mock data
export default async function handlers(req, res) {
  const {
    query: { api },
  } = req;
  switch (api) {
    case "search":
      res.status(200).json({
        status: { status: "ok", user_type: "user", extra_msg: "nothing" },
        data: { room: {}, result: false },
      });
      break;
    case "create":
      res.status(200).json({
        status: { status: "ok", user_type: "user", extra_msg: "nothing" },
        data: { room: {} },
      });
      break;
    case "currentRoom":
      res.status(200).json({
        status: { status: "ok", user_type: "user", extra_msg: "nothing" },
        data: {
          room: {
            room_id: 1,
            room_name: "test",
            description: "test",
            owner_id: 1,
            created_at: "2022-03-08",
            is_deleted: false,
          },
          messages: [
            {
              message_id: 1,
              username: "itherunder",
              content: "重新搞一次～截图留言在贴文下面～https://twitter.com/hilcobunny/status/1502532026917810178?s=21",
              from_id: 1,
              to_id: 1,
              room_id: 1,
              created_at: "2022-03-08",
            },
            {
              message_id: 2,
              username: "itherunder",
              content:
                "Metadoge discord 中文频道区每天晚上8点都有抽奖活动，欢迎大家来玩哦~ https://discord.gg/y3cCK7nw  进入后点击中国国旗即可解锁中文频道~ ",
              from_id: 1,
              to_id: 1,
              room_id: 1,
              created_at: "2022-03-08",
            },
            {
              message_id: 3,
              username: "itherunder",
              content:
                "口袋兔在DCL举办展览\n撸POAP机会来啰～记得完成任务～\nhttps://twitter.com/hilcobunny/status/1502527231901372416?s=21",
              from_id: 1,
              to_id: 1,
              room_id: 1,
              created_at: "2022-03-08",
            },
          ],
        },
      });
      break;
    case "countOnline":
      res.status(200).json({
        status: { status: "ok", user_type: "user", extra_msg: "nothing" },
        data: 2,
      });
      break;
    default:
      res.status(404).redirect("/404");
  }
}
