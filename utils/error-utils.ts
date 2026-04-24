export const extractErrorMessage = (error: any, defaultMessage: string = "An error occurred"): string => {
  const msg = error?.response?.data?.message;
  if (!msg) return defaultMessage;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg;
};
