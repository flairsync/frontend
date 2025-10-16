import secureLocalStorage from "react-secure-storage";

export const saveJwtToken = (token: string) => {
  secureLocalStorage.setItem("jwt", token);
};

export const getJwtToken = () => {
  return secureLocalStorage.getItem("jwt")?.toString();
};
