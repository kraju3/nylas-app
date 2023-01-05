import { APIRequest, apiRequest } from "../api.server";

interface RestAPI<T> {
  getAll: (url: string, accessToken: string) => Promise<T[]>;
  get: (url: string, accessToken: string) => Promise<T>;
  update: (url: string, accessToken: string, payload: any) => Promise<T>;
  create: (url: string, accessToken: string, payload: any) => Promise<T>;
  delete: (url: string, accessToken: string) => Promise<T>;
}

abstract class RequestHandler {
  async request<T>(request: APIRequest): Promise<T> {
    let res: T;
    try {
      const apiResponse = await fetch(request.url, request.config);
      res = await apiResponse.json();
      if (apiResponse.status >= 400) {
        throw new Error(apiResponse.statusText);
      }
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }
}

export class APIService<T> extends RequestHandler implements RestAPI<T> {
  async getAll(url: string, accessToken: string) {
    let response: T[];
    try {
      response = await this.request<T[]>({
        url,
        config: {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return response;
  }
  async get(url: string, accessToken: string) {
    let response: T;
    try {
      response = await this.request<T>({
        url,
        config: {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return response;
  }

  async create<S>(url: string, accessToken: string, payload: S) {
    let response: T;
    try {
      response = await this.request<T>({
        url,
        config: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return response;
  }

  async update<S>(url: string, accessToken: string, payload: S) {
    let response: T;
    try {
      response = await this.request<T>({
        url,
        config: {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return response;
  }
  async delete(url: string, accessToken: string) {
    let response: T;
    try {
      response = await this.request<T>({
        url,
        config: {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return response;
  }
}
