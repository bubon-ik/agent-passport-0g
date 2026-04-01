import { z } from "zod";
import { agentPassportSchema } from "../../shared/passport.js";
import { savePassport } from "../../server/src/services/storageService.js";
import {
  ensureMethod,
  handleOptions,
  parseJsonBody,
  sendError,
  withCors,
  type VercelApiRequest,
  type VercelApiResponse
} from "../_shared.js";

const requestSchema = z.object({
  passport: agentPassportSchema
});

export default async function handler(request: VercelApiRequest, response: VercelApiResponse) {
  if (handleOptions(request, response)) {
    return;
  }

  if (!ensureMethod(request, response, "POST")) {
    return;
  }

  try {
    const body = requestSchema.parse(parseJsonBody(request));
    const result = await savePassport(body.passport);

    withCors(response);
    response.status(200).json(result);
  } catch (error) {
    sendError(response, error);
  }
}
