import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMyProfessionalProfileApiCall,
  CreateProProfileDto,
  getMyProfessionalProfileApiCall,
} from "./service";
import { toast } from "sonner";
import { ProfessionalProfile } from "@/models/professional/ProfessionalProfile";

export const useProfessionalProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: userProfessionalProfile,
    isPending: loadingProfessionalProfile,
  } = useQuery({
    queryKey: ["user_pro_profile"],
    queryFn: async () => {
      const resp = await getMyProfessionalProfileApiCall();
      return ProfessionalProfile.parseApiResponse(resp.data.data);
    },
  });

  const { mutate: createProProfile, isPending: creatingProProfile } =
    useMutation({
      mutationKey: ["user_create_pro_profile"],
      mutationFn: (data: CreateProProfileDto) => {
        toast.loading("Creating professional profile", {
          id: "pro_profile_create_toast",
          toasterId: "pro_profile_create_toast",
        });
        return createMyProfessionalProfileApiCall(data);
      },
      onSuccess(data, variables, context) {
        toast.dismiss("pro_profile_create_toast");
        toast.success("Created", {
          description: "You professional profile was created!",
        });
        queryClient.refetchQueries({
          queryKey: ["user_pro_profile"],
        });
      },
    });

  return {
    userProfessionalProfile,
    loadingProfessionalProfile,

    createProProfile,
    creatingProProfile,
  };
};
