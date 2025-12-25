import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import { useNavigationLoading } from "../../lib/hooks/useNavigationLoading";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { authApi } from "../../lib/api/auth";
import { getLastVisitedPage } from "../../lib/utils/navigation";

export const Route = createFileRoute("/auth/register")({
  beforeLoad: async () => {
    // If user is already authenticated, redirect to last page or feed
    if (authApi.isAuthenticated()) {
      const lastPage = getLastVisitedPage();
      const redirectTo = lastPage || "/feed";
      throw redirect({
        to: redirectTo,
      });
    }
  },
  component: RegisterPage,
});

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, initiateOAuth } = useAuth();
  const { stopNavigation, startNavigation } = useNavigationLoading();
  const [registerError, setRegisterError] = useState<string | undefined>(
    undefined
  );

  // Handle navigation loading state on mount
  useEffect(() => {
    // Check if we navigated here (flag exists in sessionStorage)
    const navigationFlag = sessionStorage.getItem("tj-navigating-to-auth");
    if (navigationFlag === "true") {
      // Wait for page to be fully loaded, then stop navigation after brief delay
      const stopDelay = setTimeout(() => {
        stopNavigation();
      }, 400);

      return () => {
        clearTimeout(stopDelay);
      };
    }
  }, [stopNavigation]);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Register form onSubmit called with value:", value);
      setRegisterError(undefined); // Clear previous errors
      try {
        console.log("Calling register API...");
        await register(value.email, value.password, value.name);
        console.log("Registration successful, navigating to login...");
        startNavigation();
        navigate({ to: "/auth/login" });
      } catch (error: any) {
        console.error("Registration error:", error);
        let errorMessage = "Registration failed. Please try again.";

        if (
          error.code === "ECONNREFUSED" ||
          error.message?.includes("Network Error") ||
          error.message?.includes("Failed to fetch")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setRegisterError(errorMessage);
      }
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 mb-6 card-chamfered">
          <span className="text-white font-bold text-2xl font-display">TJ</span>
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
          Create Account
        </h1>
        <p className="text-slate-600">
          Join TransJakarta Routes to report issues and track changes
        </p>
      </div>
      <Card static>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Form onSubmit handler called", form.state.values);

            const name = form.state.values.name || "";
            const email = form.state.values.email || "";
            const password = form.state.values.password || "";

            // Validate
            const nameResult = registerSchema.shape.name.safeParse(name);
            const emailResult = registerSchema.shape.email.safeParse(email);
            const passwordResult =
              registerSchema.shape.password.safeParse(password);

            if (!nameResult.success) {
              form.setFieldMeta("name", {
                error:
                  nameResult.error.errors[0]?.message || "Invalid username",
              });
              return;
            }

            if (!emailResult.success) {
              form.setFieldMeta("email", {
                error: emailResult.error.errors[0]?.message || "Invalid email",
              });
              return;
            }

            if (!passwordResult.success) {
              form.setFieldMeta("password", {
                error:
                  passwordResult.error.errors[0]?.message || "Invalid password",
              });
              return;
            }

            // Clear errors
            setRegisterError(undefined);
            form.setFieldMeta("name", { error: undefined });
            form.setFieldMeta("email", { error: undefined });
            form.setFieldMeta("password", { error: undefined });

            // Submit directly
            console.log("Calling register directly...");
            try {
              await register(email, password, name);
              console.log("Registration successful, navigating to login...");
              startNavigation();
              navigate({ to: "/auth/login" });
            } catch (error: any) {
              console.error("Registration error:", error);
              let errorMessage = "Registration failed. Please try again.";

              if (
                error.code === "ECONNREFUSED" ||
                error.message?.includes("Network Error") ||
                error.message?.includes("Failed to fetch")
              ) {
                errorMessage =
                  "Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
              } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }

              setRegisterError(errorMessage);
            }
          }}
          className="space-y-5"
        >
          <form.Field
            name="name"
            validators={{
              onChange: zodValidator(registerSchema.shape.name),
            }}
          >
            {(field) => (
              <Input
                label="Username"
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={
                  (field.state.meta.error as string) ||
                  (typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : undefined)
                }
                placeholder="johndoe"
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: zodValidator(registerSchema.shape.email),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  setRegisterError(undefined); // Clear error when user types
                }}
                onBlur={field.handleBlur}
                error={
                  (field.state.meta.error as string) ||
                  (typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : undefined)
                }
                placeholder="you@example.com"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: zodValidator(registerSchema.shape.password),
            }}
          >
            {(field) => (
              <Input
                label="Password"
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={
                  (field.state.meta.error as string) ||
                  (typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : undefined)
                }
                placeholder="••••••••"
              />
            )}
          </form.Field>

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Creating account..." : "Create Account"}
          </Button>

          {registerError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-body">{registerError}</p>
            </div>
          )}
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-6"
            onClick={() => initiateOAuth("google")}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => {
              startNavigation();
              navigate({ to: "/" });
            }}
          >
            Continue as Guest
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
}
