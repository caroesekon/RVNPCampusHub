const ACCESS_TOKEN_KEY = 'rvnp_access_token';
const REFRESH_TOKEN_KEY = 'rvnp_refresh_token';
const USER_KEY = 'rvnp_user';
const THEME_KEY = 'theme';

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const setAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'light';
};

const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

const clearAll = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

export default {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getUser,
  setUser,
  removeUser,
  getTheme,
  setTheme,
  clearAll,
};