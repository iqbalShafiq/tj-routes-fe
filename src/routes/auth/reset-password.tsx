import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useState } from "react";
import { useResetPassword } from "../../lib/hooks/usePasswordManagement";
import { useNavigationLoading } from "../../lib/hooks/useNavigationLoading";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { RouteErrorComponent } from "../../components/RouteErrorComponent";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || undefined,
  }),
  component: ResetPasswordPage,
  errorComponent: RouteErrorComponent,
});

const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { startNavigation } = useNavigationLoading();
  const [error, setError] = useState<string | undefined>(undefined);
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setError("Invalid or missing reset token");
        return;
      }

      setError(undefined);
      try {
        await resetPasswordMutation.mutateAsync({
          token,
          new_password: value.new_password,
        });

        // Success - redirect to login with a message
        startNavigation();
        navigate({ to: "/auth/login" });
      } catch (err: any) {
        let errorMessage = "Failed to reset password. Please try again.";

        if (err.message?.includes("expired") || err.message?.includes("invalid")) {
          errorMessage =
            "This reset link has expired or is invalid. Please request a new one.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      }
    },
    validatorAdapter: zodValidator(),
  });

  // If no token, show error state
  if (!token) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-error mb-6 card-chamfered">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-text-secondary">
            This password reset link is invalid or missing.
          </p>
        </div>

        <Card static>
          <div className="space-y-4 text-center">
            <p className="text-text-secondary text-sm">
              Please request a new password reset link to continue.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <Link to="/auth/forgot-password">
                <Button variant="primary" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>

              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent mb-6 card-chamfered">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
          Reset Password
        </h1>
        <p className="text-text-secondary">
          Enter your new password below
        </p>
      </div>

      <Card static>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const newPassword = form.state.values.new_password || "";
            const confirmPassword = form.state.values.confirm_password || "";

            // Validate
            const result = resetPasswordSchema.safeParse({
              new_password: newPassword,
              confirm_password: confirmPassword,
            });

            if (!result.success) {
              // Set field errors
              result.error.errors.forEach((err) => {
                if (err.path[0] === "new_password") {
                  form.setFieldMeta("new_password", {
                    error: err.message,
                  });
                } else if (err.path[0] === "confirm_password") {
                  form.setFieldMeta("confirm_password", {
                    error: err.message,
                  });
                }
              });
              return;
            }

            // Clear errors
            setError(undefined);
            form.setFieldMeta("new_password", { error: undefined });
            form.setFieldMeta("confirm_password", { error: undefined });

            // Submit
            try {
              await resetPasswordMutation.mutateAsync({
                token,
                new_password: newPassword,
              });

              // Success - redirect to login
              startNavigation();
              navigate({ to: "/auth/login" });
            } catch (err: any) {
              let errorMessage = "Failed to reset password. Please try again.";

              if (err.message?.includes("expired") || err.message?.includes("invalid")) {
                errorMessage =
                  "This reset link has expired or is invalid. Please request a new one.";
              } else if (err.message) {
                errorMessage = err.message;
              }

              setError(errorMessage);
            }
          }}
          className="space-y-5"
        >
          <form.Field
            name="new_password"
            validators={{
              onChange: zodValidator(resetPasswordSchema.shape.new_password),
              onBlur: zodValidator(resetPasswordSchema.shape.new_password),
            }}
          >
            {(field) => (
              <Input
                label="New Password"
                type="password"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  setError(undefined);
                }}
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

          <form.Field
            name="confirm_password"
            validators={{
              onBlur: zodValidator(resetPasswordSchema),
            }}
          >
            {(field) => (
              <Input
                label="Confirm Password"
                type="password"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  setError(undefined);
                }}
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

          {/* Password Requirements */}
          <div className="p-3 bg-bg-main border border-border rounded-sm">
            <p className="text-xs font-medium text-text-secondary mb-2">
              Password must contain:
            </p>
            <ul className="text-xs text-text-muted space-y-1">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter (A-Z)</li>
              <li>• One lowercase letter (a-z)</li>
              <li>• One digit (0-9)</li>
              <li>• One special character (!@#$%^&*)</li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-sm">
              <p className="text-sm text-error font-body">{error}</p>
              {(error.includes("expired") || error.includes("invalid")) && (
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-accent hover:text-accent-hover font-medium mt-2 inline-block"
                >
                  Request a new reset link
                </Link>
              )}
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
