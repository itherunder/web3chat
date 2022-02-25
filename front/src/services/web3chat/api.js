// @ts-ignore

/* eslint-disable */
import { request } from 'umi';
/** 获取当前的用户 GET /api/currentUser */

export async function currentUser() {
  return request('/api/user/currentUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem('token'),
    },
  });
}

// 判断是否有登录信息，即jwt有没有内容，有的话就直接登录就行了
// 并且把jwt的token发过来，否则getNonce然后签名再jwt
export async function signup(options) {
  return request('/api/user/signup', {
    method: 'GET',
    params: options,
  });
}

// 从后端获得一个nonce
export async function getNonce(options) {
  return request('/api/user/getNonce', {
    method: 'GET',
    params: options,
  });
}

// 签名
export async function sign(body) {
  return request('/api/user/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

// 登录
export async function login(body) {
  return request('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem('token'),
    },
    data: body,
  });
}

// 退出登录接口 POST /api/user/outLogin
export async function outLogin(body) {
  return request('/api/user/outLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem('token'),
    },
    data: body,
  });
}

export async function updateProfile(body) {
  return request('/api/user/updateProfile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem('token'),
    },
    data: body,
  });
}
