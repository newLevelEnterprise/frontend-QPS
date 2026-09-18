import axios from "axios";
import { setToken } from "../hooks/setToken";
import { useToken } from "../hooks/useToken";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});


apiClient.interceptors.request.use(
  (config) => {
    const token = useToken();
    if(token.access_token) {
      config.headers.set("Authorization", `Bearer ${token.access_token}`);
    };

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true; 

      const {refresh_token: refreshToken} = useToken();

      if (refreshToken) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
          const response = await axios.post(`${backendUrl}/auth/refresh`, {
            refreshToken: refreshToken
          });

          const { access_token, refresh_token } = response.data;

          setToken({access_token, refresh_token});

          originalRequest.headers.set("Authorization", `Bearer ${access_token}`);

    
          return apiClient(originalRequest);
        } catch (refreshError) {
          setToken({access_token: '', refresh_token: ''});
          console.error("Failed to refresh token:", refreshError);
          window.location.href = '/login';
        }
      } else {
        setToken({access_token: '', refresh_token: ''});
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);