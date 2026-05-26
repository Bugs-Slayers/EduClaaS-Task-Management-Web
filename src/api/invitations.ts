import api from "@/lib/axios";
import type {
  ApiResponse,
  Invitation,
  AcceptDeclineInvitationRequest,
} from "@/types";

export const invitationsApi = {
  /** List all pending invitations for the logged-in user */
  listMine: () => api.get<ApiResponse<Invitation[]>>("/invitations/my"),

  /** Accept an invitation by token */
  accept: (data: AcceptDeclineInvitationRequest) =>
    api.post<ApiResponse<null>>("/invitations/accept", data),

  /** Decline an invitation by token */
  decline: (data: AcceptDeclineInvitationRequest) =>
    api.post<ApiResponse<null>>("/invitations/decline", data),
};
