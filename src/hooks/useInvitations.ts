import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invitationsApi } from "@/api/invitations";
import type { AcceptDeclineInvitationRequest } from "@/types";

export const INVITATION_KEYS = {
  mine: ["invitations", "mine"] as const,
};

export function useMyInvitations() {
  return useQuery({
    queryKey: INVITATION_KEYS.mine,
    queryFn: () => invitationsApi.listMine().then((r) => r.data.data ?? []),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcceptDeclineInvitationRequest) =>
      invitationsApi.accept(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATION_KEYS.mine });
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Invitation accepted!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to accept invitation"),
  });
}

export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcceptDeclineInvitationRequest) =>
      invitationsApi.decline(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATION_KEYS.mine });
      toast.success("Invitation declined");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to decline invitation"),
  });
}
