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
  } catch (error: any) {
    throw Error(error);
  }

  return res;
}
