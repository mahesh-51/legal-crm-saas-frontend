import * as Yup from "yup";
import type { FirmInviteRole, ModulePermissionSelection } from "@/types";

export interface InviteMemberFormValues {
  email: string;
  role: FirmInviteRole;
  modulePermissions: ModulePermissionSelection[];
}

export const inviteMemberSchema: Yup.ObjectSchema<InviteMemberFormValues> = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  role: Yup.mixed<FirmInviteRole>()
    .oneOf(["FIRM_ADMIN", "LAWYER"])
    .required("Role is required"),
  modulePermissions: Yup.array(
    Yup.object({
      module: Yup.string().trim().required(),
      actions: Yup.array(Yup.string().trim().required()).min(1),
    })
  )
    .default([])
    .test(
      "lawyer-requires-permission",
      "Select at least one module/action for LAWYER invites.",
      function validateLawyerPermissions(value) {
        const role = this.parent.role as FirmInviteRole;
        if (role === "FIRM_ADMIN") {
          return true;
        }
        const list = value ?? [];
        return list.some((entry) => entry.actions.length > 0);
      }
    ),
});
