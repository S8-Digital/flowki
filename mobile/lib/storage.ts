import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'flowki_auth_token';
const USER_KEY = 'flowki_user';

export const storage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  deleteToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),

  getUser: async () => {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: object) =>
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  deleteUser: () => SecureStore.deleteItemAsync(USER_KEY),

  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
