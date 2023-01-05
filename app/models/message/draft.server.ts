import type { User } from "@prisma/client";
import { generateQueryString } from "~/utils";
import { APIService } from "../api/service.server";
import type { Draft, ThreadsQueryParams } from "./models.server";

const NYLAS_ENDPOINT = process.env.API_ENDPOINT;

export class DraftService extends APIService<Draft> {
  endpoint = `${NYLAS_ENDPOINT}/drafts`;
  sendEndpoint = `${NYLAS_ENDPOINT}/send`;

  async getDrafts(user: User, queryParams?: Partial<ThreadsQueryParams>) {
    let res: Draft[];
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

  async getDraft(user: User, id: string, queryParams?: object) {
    let res: Draft;
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

  async updateDraft(user: User, id: string, payload: any) {
    let res: Draft;
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

  async deleteDraft(user: User, id: string) {
    let res: Draft;
    let url = `${this.endpoint}/${id}`;

    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.delete(url, user.accessToken);
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }

  async createDraft(user: User, payload: Partial<Draft>) {
    let res: Draft;

    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.create(this.endpoint, user.accessToken, payload);
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }

  async sendDraft(user: User, draft: Draft) {
    let res: Draft;

    try {
      if (!user) {
        throw Error("No user access");
      }
      res = await this.create(this.sendEndpoint, user.accessToken, {
        draft_id: draft.id,
        version: draft.version,
      });
    } catch (error: any) {
      throw Error(error);
    }

    return res;
  }
}
