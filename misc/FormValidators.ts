import * as Yup from "yup";

// ✅ Reusable password validation rule
export const passwordValidation = Yup.string()
  .min(8, "Password must be at least 8 characters long")
  .matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  )
  .max(50, "Too Long!")
  .required("Required");

export const SignupFormSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  password: passwordValidation,
});

export const LoginFormSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: passwordValidation,
});

export const UpdatePasswordSchema = Yup.object().shape({
  currentPassword: passwordValidation,
  newPassword: passwordValidation,
  repeatNewPassword: passwordValidation.oneOf(
    [Yup.ref("newPassword")],
    "Passwords must match"
  ),
});
