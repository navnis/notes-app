import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Input } from "@/components";
import { AuthLayout, validateLoginForm, type LoginFormErrors } from "@/auth";
import { useAuth } from "@/hooks/useAuth";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Log in"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          togglePasswordVisibility
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        {errors.form && (
          <p className="text-sm text-destructive" role="alert">
            {errors.form}
          </p>
        )}
        <Button type="submit" loading={loading}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
