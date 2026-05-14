import { delay } from "../lib/apiClient";
import { Lead } from "../types";

export const leadService = {
  // Future API: POST /api/leads
  createLead: async (payload: Partial<Lead>) => {
    await delay(300);
    return true;
  }
};
