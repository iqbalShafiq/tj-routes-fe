import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useChangePassword } from "../lib/hooks/usePasswordManagement";
import { useAuth } from "../lib/hooks/useAuth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface FormErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
  general?: string;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const { user } = useAuth();
  const changePasswordMutation = useChangePassword();

  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const isOAuthUser = user?.oauth_provider;

  const resetForm = () => {
    setFormData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setErrors({});
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Current password validation
    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    // New password validation
    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else {
      if (formData.new_password.length < 8) {
        newErrors.new_password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.new_password)) {
        newErrors.new_password = "Must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.new_password)) {
        newErrors.new_password = "Must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.new_password)) {
        newErrors.new_password = "Must contain at least one digit";
      } else if (!/[^A-Za-z0-9]/.test(formData.new_password)) {
        newErrors.new_password = "Must contain at least one special character";
      }

      // Check if new password is same as current
      if (
        formData.new_password &&
        formData.current_password &&
        formData.new_password === formData.current_password
      ) {
        newErrors.new_password =
          "New password must be different from current password";
      }
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await changePasswordMutation.mutateAsync({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      setSuccess(true);
      setErrors({});

      // Close modal after a brief delay to show success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Failed to change password. Please try again.";

      if (err.message?.includes("incorrect") || err.message?.includes("wrong")) {
        errorMessage = "Current password is incorrect.";
        setErrors({ current_password: errorMessage });
      } else if (err.message?.includes("same")) {
        errorMessage = "New password must be different from current password.";
        setErrors({ new_password: errorMessage });
      } else if (err.message?.includes("OAuth")) {
        errorMessage = "Password change is not available for OAuth accounts.";
        setErrors({ general: errorMessage });
      } else if (err.message) {
        errorMessage = err.message;
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    }
  };

  const isLoading = changePasswordMutation.isPending;

  // OAuth user message
  if (isOAuthUser) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Change Password" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-info/10 border border-info/20 rounded-sm">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-info flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">
                  Password Change Not Available
                </p>
                <p className="text-sm text-text-secondary">
                  You signed up using {user?.oauth_provider}. To change your password,
                  please use your {user?.oauth_provider} account settings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Success state
  if (success) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Password Changed"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success mb-4 card-chamfered">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
              Password Changed Successfully
            </h3>
            <p className="text-sm text-text-secondary">
              Your password has been updated. You can now use your new password to
              sign in.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // Change password form
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password" size="md">
      <div className="space-y-4">
        {/* General error */}
        {errors.general && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-sm">
            <p className="text-sm text-error font-body">{errors.general}</p>
          </div>
        )}

        {/* Current Password */}
        <div>
          <Input
            label="Current Password"
            type="password"
            value={formData.current_password}
            onChange={(e) => {
              setFormData({ ...formData, current_password: e.target.value });
              setErrors({ ...errors, current_password: undefined, general: undefined });
            }}
            error={errors.current_password}
            placeholder="••••••••"
          />
        </div>

        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            value={formData.new_password}
            onChange={(e) => {
              setFormData({ ...formData, new_password: e.target.value });
              setErrors({ ...errors, new_password: undefined, general: undefined });
            }}
            error={errors.new_password}
            placeholder="••••••••"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <Input
            label="Confirm New Password"
            type="password"
            value={formData.confirm_password}
            onChange={(e) => {
              setFormData({ ...formData, confirm_password: e.target.value });
              setErrors({ ...errors, confirm_password: undefined, general: undefined });
            }}
            error={errors.confirm_password}
            placeholder="••••••••"
          />
        </div>

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

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Change Password
          </Button>
        </div>
      </div>
    </Modal>
  );
};
