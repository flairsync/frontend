import * as Yup from "yup";

//  Reusable password validation rule
export const passwordValidation = Yup.string()
  .min(8, "input_errors.password.min_length")
  .matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
    "input_errors.password.requirements"
  )
  .max(50, "input_errors.password.too_long")
  .required("input_errors.password.required");

export const SignupFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("input_errors.email.invalid")
    .required("input_errors.email.required"),
  firstName: Yup.string().required("input_errors.firstName.required"),
  lastName: Yup.string().required("input_errors.lastName.required"),
  password: passwordValidation,
  repeatPassword: Yup.string()
    .oneOf(
      [Yup.ref("password"), undefined],
      "input_errors.repeat_password.mismatch"
    )
    .required("input_errors.repeat_password.required"),
});

export const LoginFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("input_errors.email.invalid")
    .required("input_errors.email.required"),
  password: passwordValidation,
});

export const UpdatePasswordSchema = Yup.object().shape({
  currentPassword: passwordValidation,
  newPassword: passwordValidation,
  repeatNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "input_errors.repeatNewPassword.mismatch")
    .required("input_errors.repeatNewPassword.required"),
});

// Professional validations

export const CreateProfessionalProfileSchema = Yup.object().shape({
  fname: Yup.string()
    .required("input_errors.firstName.required")
    .max(100, "input_errors.firstName.too_long"),
  lname: Yup.string()
    .required("input_errors.lastName.required")
    .max(100, "input_errors.lastName.too_long"),
  mname: Yup.string().optional(),
  dname: Yup.string()
    .required("input_errors.displayName.required")
    .max(100, "input_errors.displayName.too_long"),
  email: Yup.string()
    .email("input_errors.email.invalid")
    .required("input_errors.email.required"),
  confirmed: Yup.bool()
    .required("input_errors.checkbox.required")
    .isTrue("input_errors.checkbox.required"),
});

export const RoleSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Role name is too short")
    .max(50, "Role name is too long")
    .required("Role name is required"),

  permissions: Yup.array()
    .of(
      Yup.object({
        permissionId: Yup.string().required(),
        flags: Yup.object({
          canRead: Yup.boolean(),
          canCreate: Yup.boolean(),
          canUpdate: Yup.boolean(),
          canDelete: Yup.boolean(),
        }),
      })
    )
    .min(1, "At least one permission is required"),
});

// employees

export const inviteNewEmployeeSchema = Yup.object({
  email: Yup.string()
    .email("input_errors.email.invalid")
    .required("input_errors.email.required"),
});
