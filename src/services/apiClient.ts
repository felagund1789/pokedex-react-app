import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_POKEMON_API_BASE_URL;

export interface FetchResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const axiosInstance = axios.create({
  baseURL: API_URL,
});

class ApiClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(config?: AxiosRequestConfig) {
    return axiosInstance
      .get<FetchResponse<T>>(this.endpoint, config)
      .then((res) => res.data);
  }

  async get(id: number | string, config?: AxiosRequestConfig) {
    return axiosInstance
      .get<T>(`${this.endpoint}/${id}`, config)
      .then((res) => res.data);
  }
}

export default ApiClient;
