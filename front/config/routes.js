export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
          {
            name: 'profile',
            path: '/user/profile',
            component: './user/Profile',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/room',
    layout: false,
    routes: [
      {
        path: '/room',
        routes: [
          {
            name: 'search',
            path: '/room/search',
            component: './room/SearchRoom',
          },
          {
            name: 'chat',
            path: '/room/chat/:roomName',
            component: './room/Chat',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/room/search',
  },
  {
    component: './404',
  },
];
