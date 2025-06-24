export function sanitizePhone(phone) {
  if (!phone) return phone;
  if (phone.startsWith(" ") && /^\d+$/.test(phone.slice(1))) {
    return "+" + phone.slice(1);
  }
  if (phone.startsWith("+")) return phone;
  return phone;
}
