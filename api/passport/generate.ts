import { generatePassportInputSchema } from "../../shared/passport.js";
import { generatePassport } from "../../server/src/services/computeService.js";
import {
  ensureMethod,
  handleOptions,
  parseJsonBody,
  sendError,
  withCors,
  type VercelApiRequest,
  type VercelApiResponse
} from "../_shared.js";

export default async function handler(request: VercelApiRequest, response: VercelApiResponse) {
  if (handleOptions(request, response)) {
    return;
  }

  if (!ensureMethod(request, response, "POST")) {
    return;
  }

  try {
    const input = generatePassportInputSchema.parse(parseJsonBody(request));
    const result = await generatePassport(input);

    withCors(response);
    response.status(200).json({
      passport: result.passport,
      mode: result.mode
    });
  } catch (error) {
    sendError(response, error);
  }
}
