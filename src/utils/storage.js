const KEYS = {
  ACCESS_TOKEN: 'rvnp_access_token',
  REFRESH_TOKEN: 'rvnp_refresh_token',
  DARK_MODE: 'rvnp_darkMode',
  USER: 'rvnp_user',
};

export const storage = {
  getAccessToken: () => localStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token) => localStorage.setItem(KEYS.ACCESS_TOKEN, token),
  getRefreshToken: () => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => localStorage.setItem(KEYS.REFRESH_TOKEN, token),
  clearTokens: () => {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
  },
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USER));
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(KEYS.USER),
  getDarkMode: () => localStorage.getItem(KEYS.DARK_MODE) === 'true',
  setDarkMode: (val) => localStorage.setItem(KEYS.DARK_MODE, val),
};