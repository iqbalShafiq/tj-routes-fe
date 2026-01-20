import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useState } from "react";
import { useForgotPassword } from "../../lib/hooks/usePasswordManagement";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { RouteErrorComponent } from "../../components/RouteErrorComponent";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
  errorComponent: RouteErrorComponent,
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function ForgotPasswordPage() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setError(undefined);
      try {
        await forgotPasswordMutation.mutateAsync(value);
        setSuccess(true);
      } catch (err: any) {
        let errorMessage = "Failed to send reset email. Please try again.";

        if (err.message?.includes("Too many requests")) {
          errorMessage = "Too many requests. Please try again in an hour.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      }
    },
    validatorAdapter: zodValidator(),
  });

  if (success) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success mb-6 card-chamfered">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Check Your Email
          </h1>
          <p className="text-text-secondary">
            If an account exists with that email, we've sent password reset
            instructions.
          </p>
        </div>

        <Card static>
          <div className="space-y-4 text-center">
            <p className="text-text-secondary text-sm">
              The reset link will expire in 1 hour. If you don't receive an
              email, check your spam folder or try again.
            </p>

            <div className="pt-4">
              <Link
                to="/auth/login"
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Back to Login
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
          Forgot Password?
        </h1>
        <p className="text-text-secondary">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <Card static>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const email = form.state.values.email || "";

            // Validate
            const emailResult = forgotPasswordSchema.shape.email.safeParse(email);

            if (!emailResult.success) {
              form.setFieldMeta("email", {
                error: emailResult.error.errors[0]?.message || "Invalid email",
              });
              return;
            }

            // Clear errors
            setError(undefined);
            form.setFieldMeta("email", { error: undefined });

            // Submit
            try {
              await forgotPasswordMutation.mutateAsync({ email });
              setSuccess(true);
            } catch (err: any) {
              let errorMessage = "Failed to send reset email. Please try again.";

              if (err.message?.includes("Too many requests")) {
                errorMessage = "Too many requests. Please try again in an hour.";
              } else if (err.message) {
                errorMessage = err.message;
              }

              setError(errorMessage);
            }
          }}
          className="space-y-5"
        >
          <form.Field
            name="email"
            validators={{
              onChange: zodValidator(forgotPasswordSchema.shape.email),
              onBlur: zodValidator(forgotPasswordSchema.shape.email),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
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
                placeholder="you@example.com"
              />
            )}
          </form.Field>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-sm">
              <p className="text-sm text-error font-body">{error}</p>
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
