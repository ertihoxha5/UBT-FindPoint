import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

export const getStoredToken = async () => AsyncStorage.getItem(TOKEN_KEY);

export const storeToken = async (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);

export const clearStoredToken = async () => AsyncStorage.removeItem(TOKEN_KEY);
