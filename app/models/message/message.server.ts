import { generateQueryString } from "~/utils";
import { apiRequest } from "../api.server";
import { APIService } from "../api/service.server";
import type { User } from "../user.server";
import type { Message, ThreadsQueryParams } from "./models.server";

const NYLAS_ENDPOINT = process.env.API_ENDPOINT;

export async function getLabelsOrFolders<T>(
  type: "labels" | "folders",
  user: User
): Promise<T> {
  let res: T;
  try {
    const token = user.accessToken;
    res = await apiRequest({
      url: `${NYLAS_ENDPOINT}/${type}`,
      config: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}

export class MessageService extends APIService<Message> {
  endpoint = `${NYLAS_ENDPOINT}/messages`;
  sendEndpoint = `${NYLAS_ENDPOINT}/send`;

  async getMessages(user: User, queryParams?: Partial<ThreadsQueryParams>) {
    let res: Message[];
    let url = `${this.endpoint}`;
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

  async getMessage(user: User, id: string, queryParams?: object) {
    let res: Message;
    let url = `${this.endpoint}/${id}`;
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

  async updateMessage(user: User, id: string, payload: any) {
    let res: Message;
    let url = `${this.endpoint}/${id}`;

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

  async sendMessage<T>(user: User, payload: Partial<T>) {
    let res: Message;

    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.create(this.sendEndpoint, user.accessToken, payload);
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }
}
