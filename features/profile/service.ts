import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/users`;

const myUserProfileUrl = `${baseUrl}/me`;

export const getUserProfileApiCall = () => {
  return flairapi.get(myUserProfileUrl);
};
