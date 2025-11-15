import * as Yup from "yup";

// ✅ Reusable password validation rule
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
