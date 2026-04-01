import { checkHealth } from "../server/src/services/healthService.js";
import {
  ensureMethod,
  handleOptions,
  sendError,
  withCors,
  type VercelApiRequest,
  type VercelApiResponse
} from "./_shared.js";

export default async function handler(request: VercelApiRequest, response: VercelApiResponse) {
  if (handleOptions(request, response)) {
    return;
  }

  if (!ensureMethod(request, response, "GET")) {
    return;
  }

  try {
    const health = await checkHealth();
    withCors(response);
    response.status(200).json(health);
  } catch (error) {
    sendError(response, error);
  }
}
