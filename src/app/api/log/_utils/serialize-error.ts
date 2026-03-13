import type { z } from "zod";
import type { errorMessageSchema } from "../_schemas/error-message";

type ErrorMessage = z.infer<typeof errorMessageSchema>;

export function serializeError(errorMessage: ErrorMessage) {
  const hasErr = "err" in errorMessage;

  const oldErrorMessage = hasErr ? errorMessage.err : errorMessage;

  const { msg, type, stack, cause, ...messageRest } = oldErrorMessage;
  const { message: causeMessage, stack: causeStack } = cause ?? {};
  const newErrorMessage = {
    err: {
      type,
      message: causeMessage ? `${msg}: ${causeMessage}` : msg,
      stack: causeStack ? `${stack}\ncaused by: ${causeStack}` : stack,
      ...messageRest,
    },
    msg,
  };

  if (hasErr) {
    return { ...errorMessage, ...newErrorMessage };
  } else {
    return newErrorMessage;
  }
}
