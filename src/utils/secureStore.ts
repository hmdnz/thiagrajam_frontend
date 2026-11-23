import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'winnie4_access_token';
const USER_DATA_KEY = 'winnie4_user_data';

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function deleteAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveUserData(data: any): Promise<void> {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(data));
}

export async function getUserData<T>(): Promise<T | null> {
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function clearSecureStorage(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}
