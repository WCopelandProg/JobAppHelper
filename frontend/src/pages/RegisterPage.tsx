import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  school?: string;
  gradYear?: number;
}

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      await registerUser({
        ...data,
        gradYear: data.gradYear ? Number(data.gradYear) : undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Start finding roles that fit you</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input id="fullName" className="input" {...register("fullName", { required: "Full name is required" })} />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className="input" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Must be at least 8 characters" },
              })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="school">
                School
              </label>
              <input id="school" className="input" {...register("school")} />
            </div>
            <div>
              <label className="label" htmlFor="gradYear">
                Grad year
              </label>
              <input id="gradYear" type="number" className="input" {...register("gradYear")} />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
