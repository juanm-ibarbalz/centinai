import { sanitizePhone } from "../utils/phoneUtils.js";

export function sanitizePhoneQuery(paramName) {
  return function (req, res, next) {
    if (req.query[paramName]) {
      req.query[paramName] = sanitizePhone(req.query[paramName]);
    }
    next();
  };
}
