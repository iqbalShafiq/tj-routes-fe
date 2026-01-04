import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { UserSavedNavigation, CreateNavigationRequest, UpdateNavigationRequest, NavigationPoint } from '../lib/api/personalized';
import { useCreateSavedNavigation, useUpdateSavedNavigation } from '../lib/hooks/usePersonalized';

interface NavigationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigation?: UserSavedNavigation | null;
  onSuccess?: () => void;
}

export const NavigationFormModal = ({
  isOpen,
  onClose,
  navigation,
  onSuccess,
}: NavigationFormModalProps) => {
  const isEditing = !!navigation;
  const createMutation = useCreateSavedNavigation();
  const updateMutation = useUpdateSavedNavigation();

  const [formData, setFormData] = useState<CreateNavigationRequest>({
    name: '',
    from: { place_type: 'stop' },
    to: { place_type: 'stop' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (navigation) {
      setFormData({
        name: navigation.name,
        from: navigation.from,
        to: navigation.to,
      });
    }
  }, [navigation]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.from.place_name && !formData.from.stop_name) {
      newErrors.from = 'Starting point is required';
    }

    if (!formData.to.place_name && !formData.to.stop_name) {
      newErrors.to = 'Destination is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing && navigation) {
        await updateMutation.mutateAsync({ id: navigation.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess?.();
      onClose();
    } catch {
      // Error handling is done by the mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleFromPlaceNameChange = (value: string) => {
    setFormData({
      ...formData,
      from: { ...formData.from, place_name: value, place_type: 'custom' },
    });
  };

  const handleToPlaceNameChange = (value: string) => {
    setFormData({
      ...formData,
      to: { ...formData.to, place_name: value, place_type: 'custom' },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Navigation' : 'Save Navigation'}
      size="md"
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Name <span className="text-error">*</span>
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Commute, Gym Route"
            error={errors.name}
          />
        </div>

        {/* From */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            From <span className="text-error">*</span>
          </label>
          <Input
            value={formData.from.place_name || formData.from.stop_name || ''}
            onChange={(e) => handleFromPlaceNameChange(e.target.value)}
            placeholder="Enter starting point (place name or stop)"
            error={errors.from}
          />
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            To <span className="text-error">*</span>
          </label>
          <Input
            value={formData.to.place_name || formData.to.stop_name || ''}
            onChange={(e) => handleToPlaceNameChange(e.target.value)}
            placeholder="Enter destination (place name or stop)"
            error={errors.to}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Save Navigation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
