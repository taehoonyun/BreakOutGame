import axios from "axios";
import config from "@/config";
const client = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    "Content-Type": "application/json",
    "Admin-Version": config.api.adminVersion,
  },
});

// Intercept all requests
// client.interceptors.request.use(
//     (config) => {
//         try {
//             const {
//                 user: { token },
//             } = store.getState();

//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`;
//             }
//         } catch (err) {
//             console.error(err);
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
export interface Login {
  userId: string;
}
export type SaveResponse = {
    result: boolean;
    data: object;
};
export const getAuth = async (userId: string) => {
  try {
    const response = await client.get<Login>("/auth/login", {
      params: {
        userId,
      },
    });
    return response.data ?? [];
  } catch (err: any) {
    throw new Error(err.response?.data?.err ?? err.message);
  }
};
export const loginId = async (userId: string) => {
  try {
    const response = await client.post<SaveResponse>("/auth/login", {
      params: {
        userId,
      },
    });
    return response.data ?? [];
  } catch (err: any) {
    throw new Error(err.response?.data?.err ?? err.message);
  }
};
