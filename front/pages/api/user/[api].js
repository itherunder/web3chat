
// mock data
export default async function handlers(req, res) {
  const {
    query: { api },
  } = req
  switch (api) {
    case 'currentUser':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false}
      })
      break;
    case 'checkUsername':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {
          user: {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false},
          result: true
        }
      })
      break;
    case 'updateProfile':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false}
      })
      break;
    case 'getNonce':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': 5382
      })
      break;
    case 'signup':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false}
      })
      break;
    case 'signLoginMessage':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': 'the_token'
      })
      break;
    case 'login':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false}
      })
      break;
    case 'sendMessage':
      res.status(200).json({
        'status': {status: 'ok', user_type: 'user', extra_msg: 'nothing'},
        'data': {
          user: {user_id: 1, address: '0x3b...20', username: 'itherunder', created_at: '2022-03-07', is_deleted: false},
          message: {message_id: 1, username: 'itherunder', content: 'mock content', from_id: 1, to_id: 1, room_id: 1, created_at: '2022-03-14'},
        }
      })
      break;
    default:
      res.status(404).redirect('/404')
  }
}
