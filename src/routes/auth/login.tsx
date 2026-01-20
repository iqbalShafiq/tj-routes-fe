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
import { RouteErrorComponent } from "../../components/RouteErrorComponent";

export const Route = createFileRoute("/auth/login")({
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
  component: LoginPage,
  errorComponent: RouteErrorComponent,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, initiateOAuth } = useAuth();
  const { stopNavigation, startNavigation } = useNavigationLoading();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

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
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log("onSubmit called with value:", value);
      setLoginError(undefined); // Clear previous errors
      try {
        console.log("Calling login API...");
        await login(value.email, value.password);
        console.log("Login successful, navigating...");
        startNavigation();
        navigate({ to: "/" });
      } catch (error: any) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please try again.";

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

        setLoginError(errorMessage);
        // Error is now displayed below the form, not on the field
      }
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent mb-6 card-chamfered">
          <span className="text-white font-bold text-2xl font-display">TJ</span>
        </div>
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to continue to TransJakarta Routes
        </p>
      </div>
      <Card static>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Form onSubmit handler called", form.state.values);

            const email = form.state.values.email || "";
            const password = form.state.values.password || "";

            // Validate
            const emailResult = loginSchema.shape.email.safeParse(email);
            const passwordResult =
              loginSchema.shape.password.safeParse(password);

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
            setLoginError(undefined);
            form.setFieldMeta("email", { error: undefined });
            form.setFieldMeta("password", { error: undefined });

            // Submit directly
            console.log("Calling login directly...");
            try {
              await login(email, password);
              console.log("Login successful, navigating...");
              startNavigation();
              navigate({ to: "/" });
            } catch (error: any) {
              console.error("Login error:", error);
              let errorMessage = "Login failed. Please try again.";

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

              setLoginError(errorMessage);
            }
          }}
          className="space-y-5"
        >
          <form.Field
            name="email"
            validators={{
              onChange: zodValidator(loginSchema.shape.email),
              onBlur: zodValidator(loginSchema.shape.email),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  setLoginError(undefined); // Clear error when user types
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
              onChange: zodValidator(loginSchema.shape.password),
              onBlur: zodValidator(loginSchema.shape.password),
            }}
          >
            {(field) => (
              <div>
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
                <div className="text-right mt-1">
                  <a
                    href="/auth/forgot-password"
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            )}
          </form.Field>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={form.state.isSubmitting}
            onClick={(e) => {
              console.log("Button clicked", {
                isSubmitting: form.state.isSubmitting,
                values: form.state.values,
                errors: form.state.fieldMeta,
              });
            }}
          >
            {form.state.isSubmitting ? "Logging in..." : "Sign In"}
          </Button>

          {loginError && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-sm">
              <p className="text-sm text-error font-body">{loginError}</p>
            </div>
          )}
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-surface text-text-muted font-medium relative z-10">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-7"
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
            Sign in with Google
          </Button>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="tertiary"
            className="w-full"
            onClick={() => {
              startNavigation();
              navigate({ to: "/" });
            }}
          >
            Continue as Guest
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <a
            href="/auth/register"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Register
          </a>
        </p>
      </Card>
    </div>
  );
}
