import type { User } from "@prisma/client";
import { generateQueryString } from "~/utils";
import { APIService } from "../api/service.server";
import type { Thread, ThreadsQueryParams } from "./models.server";

const NYLAS_ENDPOINT = process.env.API_ENDPOINT;

export class ThreadService extends APIService<Thread> {
  threadEndpoint = `${NYLAS_ENDPOINT}/threads`;
  async getThreads(user: User, queryParams?: Partial<ThreadsQueryParams>) {
    let res: Thread[];
    let url = this.threadEndpoint;
    if (queryParams) {
      const queryString = generateQueryString(queryParams);
      url += `?${queryString}`;
    }
    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.getAll(url, user.accessToken);
    } catch (error: any) {
      throw Error(error);
    }
    return res;
  }

  async getThread(user: User, id: string, queryParams?: object) {
    let res: Thread;
    let url = `${this.threadEndpoint}/${id}`;
    if (queryParams) {
      const queryString = generateQueryString(queryParams);
      url += `?${queryString}`;
    }
    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.get(url, user.accessToken);
    } catch (error: any) {
      throw Error(error);
    }
    return res;
  }

  async updateThread(user: User, id: string, payload: any) {
    let res: Thread;
    let url = `${this.threadEndpoint}/${id}`;

    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.update(url, user.accessToken, payload);
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }
}
