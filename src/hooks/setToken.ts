import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/tokens";

export const setToken = ({access_token, refresh_token}: {access_token: string; refresh_token: string}): boolean => {
  if(typeof window === 'undefined') {
    return false;
  }

  localStorage.setItem(ACCESS_TOKEN, access_token);
  localStorage.setItem(REFRESH_TOKEN, refresh_token);

  return true;
}