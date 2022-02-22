// @ts-ignore

/* eslint-disable */
import { request } from 'umi';
/** 获取当前的用户 GET /api/currentUser */

export async function currentUser(options) {
  return request('/api/user/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

// 判断是否有登录信息，即jwt有没有内容，有的话就直接登录就行了
// 并且把jwt的token发过来，否则getNonce然后签名再jwt
export async function signup(options) {
  return request('/api/user/signup', {
    method: 'GET',
    ...(options || {}),
  });
}

// 从后端获得一个nonce
export async function getNonce(options) {
  return request('/api/user/getNonce', {
    method: 'GET',
    ...(options || {}),
  });
}

// 签名登录
export async function sign(body, options) {
  return request('/api/user/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


// 退出登录接口 POST /api/user/outLogin
export async function outLogin(options) {
  return request('/api/user/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}
