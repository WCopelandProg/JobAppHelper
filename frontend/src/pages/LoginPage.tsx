import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to log in with those credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to JobAppHelper</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>

        <p className="mt-6 rounded-lg bg-slate-100 p-3 text-center text-xs text-slate-500">
          Demo account: <span className="font-mono">demo@jobapphelper.dev</span> / <span className="font-mono">Password123!</span>
        </p>
      </div>
    </div>
  );
}
