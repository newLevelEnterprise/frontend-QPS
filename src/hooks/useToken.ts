import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/tokens";

export const useToken = (): {access_token: string; refresh_token: string} => {
  if(typeof window === 'undefined') {
    return { access_token: '', refresh_token: '' };
  }

  const access_token = localStorage.getItem(ACCESS_TOKEN) || '';
  const refresh_token = localStorage.getItem(REFRESH_TOKEN) || '';

  return { access_token, refresh_token };
}