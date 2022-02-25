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
    path: '/app',
    layout: false,
    routes: [
      {
        path: '/app',
        routes: [
          {
            name: 'search',
            path: '/app/search',
            component: './app/SearchChat',
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
    redirect: '/app/search',
  },
  {
    component: './404',
  },
];
