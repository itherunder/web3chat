
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
      default:
        res.status(404).redirect('/404')
    }
  }
  