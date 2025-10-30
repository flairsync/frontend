import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disconnectUserSessionsApiCall,
  getUserSessionsApiCall,
} from "./service";
import { UserSession } from "@/models/UserSession";
import { usePageContext } from "vike-react/usePageContext";

export const useSession = () => {
  const queryClient = useQueryClient();
  const { user } = usePageContext();

  const { data: userSessions } = useQuery({
    queryKey: ["user_sessions_list"],
    queryFn: async () => {
      const res = await getUserSessionsApiCall();
      if (res.data.success) {
        return UserSession.parseApiArrayResponse(res.data.data);
      }
    },
    enabled: user != null,
  });

  const { mutate: disconnectUserSession } = useMutation({
    mutationKey: ["disconnect_user_session"],
    mutationFn: disconnectUserSessionsApiCall,
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["user_sessions_list"],
      });
    },
  });
  return {
    userSessions,
    disconnectUserSession,
  };
};
