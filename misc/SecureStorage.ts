import secureLocalStorage from "react-secure-storage";

export const saveJwtToken = (token: string) => {
  secureLocalStorage.setItem("jwt", token);
};

export const getJwtToken = () => {
  return secureLocalStorage.getItem("jwt")?.toString();
};

export const clearJwtToken = () => {
  secureLocalStorage.removeItem("jwt");
};

// Generic helpers for other auth/session credentials (e.g. station device tokens)
// that need encrypted-at-rest storage but don't warrant their own named wrapper.
export const saveSecureItem = (key: string, value: string) => {
  secureLocalStorage.setItem(key, value);
};

export const getSecureItem = (key: string): string | undefined => {
  return secureLocalStorage.getItem(key)?.toString();
};

export const removeSecureItem = (key: string) => {
  secureLocalStorage.removeItem(key);
};
