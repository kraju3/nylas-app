import { Response } from "@remix-run/node";

export type APIRequest = {
  url: string;
  config: RequestInit | undefined;
};

export async function apiRequest<T>(request: APIRequest): Promise<T> {
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
