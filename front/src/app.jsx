import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { history } from 'umi';
import { currentUser as queryCurrentUser } from './services/web3chat/api';
import defaultSettings from '../config/defaultSettings';
const loginPath = '/user/login';
/** 获取用户信息比较慢的时候会展示一个 loading */

export const initialStateConfig = {
  loading: <PageLoading />,
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

export async function getInitialState() {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.user;
    } catch (error) {
      console.log('queryCurrentUser error');
      history.push(loginPath);
    }

    return undefined;
  };

  let currentUser = null;
  // 如果是登录页面，不执行
  console.log('debug getInitialState');
  if (history.location.pathname !== loginPath) {
    currentUser = await fetchUserInfo();
  }
  console.log('debug', currentUser);
  return {
    fetchUserInfo,
    currentUser,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = ({ initialState, setInitialState }) => {
  console.log('debug', initialState);
  return {
    onPageChange: () => {
      console.log('debug', initialState);
      const { location } = history; // 如果没有登录，重定向到 login

      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
  };
};
