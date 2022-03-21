import request from 'umi-request';

const proxy = process.env.NEXT_PUBLIC_PROXY;

export async function currentUser(token) {
  return request.post(proxy + '/api/user/currentUser', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
}

export async function signup(options) {
  return request.get(proxy + '/api/user/signup', {
    params: options,
  });
}

export async function getNonce(options) {
  return request.get(proxy + '/api/user/getNonce', {
    params: options,
  });
}

export async function signLogin(body) {
  return request.post(proxy + '/api/user/signLoginMessage', {
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function login(body, token) {
  return request.post(proxy + '/api/user/login', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function checkUsername(options, token) {
  return request.get(proxy + '/api/user/checkUsername', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    params: options,
  });
}

export async function updateProfile(body, token) {
  return request.post(proxy + '/api/user/updateProfile', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function searchRoom(options, token) {
  return request.get(proxy + '/api/room/search', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    params: options,
  });
}

export async function signCreateRoom(body, token) {
  return request.post(proxy + '/api/room/signCreateMessage', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function createRoom(body, token) {
  return request.post(proxy + '/api/room/create', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function currentRoom(options, token) {
  return request.get(proxy + '/api/room/currentRoom', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    params: options,
  });
}

export async function latestMessage(body, token) {
  return request.post(proxy + '/api/message/latest', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function sendMessage(body, token) {
  return request.post(proxy + '/api/user/sendMessage', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function countOnline(options, token) {
  return request.get(proxy + '/api/room/countOnline', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    params: options,
  });
}

export async function isOpened(body, token) {
  return request.post(proxy + '/api/message/isOpened', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export async function openRedPacket(body, token) {
  return request.post(proxy + '/api/user/openRedPacket', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

