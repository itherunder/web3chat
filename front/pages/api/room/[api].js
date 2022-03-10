
// mock data
export default async function handlers(req, res) {
    const {
      query: { api },
    } = req
    switch (api) {
      case 'search':
        res.status(200).json({
          'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
          'data': {room: {}, result: false}
        })
        break;
      case 'create':
        res.status(200).json({
          'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
          'data': {room: {}}
        })
        break;
      case 'currentRoom':
        res.status(200).json({
          'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
          'data': {room: {room_id: 1, room_name: 'test', description: 'test', owner_id: 1, created_at: '2022-03-08', is_deleted: false}, messages: [
            {message_id: 1, username: 'itherunder', content: 'test1', from_id: 1, to_id: 1, room_id: 1, created_at: '2022-03-08'},
            {message_id: 2, username: 'itherunder', content: 'test2', from_id: 1, to_id: 1, room_id: 1, created_at: '2022-03-08'},
            {message_id: 3, username: 'itherunder', content: 'test3', from_id: 1, to_id: 1, room_id: 1, created_at: '2022-03-08'},
          ]}
        })
        break;
      default:
        res.status(404).redirect('/404')
    }
  }
  