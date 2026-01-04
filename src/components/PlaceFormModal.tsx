import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import type { UserPlace, CreatePlaceRequest, UpdatePlaceRequest, PlaceType } from '../lib/api/personalized';
import { getPlaceTypeLabel } from './PlaceTypeIcon';
import { useCreatePlace, useUpdatePlace } from '../lib/hooks/usePersonalized';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  place?: UserPlace | null;
  initialLatitude?: number;
  initialLongitude?: number;
  onSuccess?: () => void;
}

const PLACE_TYPES: PlaceType[] = ['home', 'office', 'school', 'gym', 'shopping', 'restaurant', 'hospital', 'other', 'custom'];

export const PlaceFormModal = ({
  isOpen,
  onClose,
  place,
  initialLatitude,
  initialLongitude,
  onSuccess,
}: PlaceFormModalProps) => {
  const isEditing = !!place;
  const createMutation = useCreatePlace();
  const updateMutation = useUpdatePlace();

  const [formData, setFormData] = useState<CreatePlaceRequest>({
    place_type: 'other',
    name: '',
    latitude: initialLatitude || 0,
    longitude: initialLongitude || 0,
    address: '',
    notes: '',
    is_default: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (place) {
      setFormData({
        place_type: place.place_type,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address || '',
        notes: place.notes || '',
        is_default: place.is_default,
      });
    } else if (initialLatitude && initialLongitude) {
      setFormData((prev) => ({
        ...prev,
        latitude: initialLatitude,
        longitude: initialLongitude,
      }));
    }
  }, [place, initialLatitude, initialLongitude]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.place_type) {
      newErrors.place_type = 'Place type is required';
    }

    if (formData.latitude === 0 && formData.longitude === 0) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing && place) {
        await updateMutation.mutateAsync({ id: place.id, data: formData });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Place' : 'Add New Place'}
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
            placeholder="e.g., My Home, Office, etc."
            error={errors.name}
          />
        </div>

        {/* Place Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Place Type <span className="text-error">*</span>
          </label>
          <Select
            value={formData.place_type}
            onChange={(e) =>
              setFormData({ ...formData, place_type: e.target.value as PlaceType })
            }
            error={errors.place_type}
          >
            {PLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {getPlaceTypeLabel(type)}
              </option>
            ))}
          </Select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Location <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={(e) =>
                setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
              }
              placeholder="Latitude"
            />
            <Input
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={(e) =>
                setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
              }
              placeholder="Longitude"
            />
          </div>
          {errors.location && (
            <p className="text-sm text-error mt-1">{errors.location}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Address
          </label>
          <Input
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address (optional)"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes
          </label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes (optional)"
            rows={3}
          />
        </div>

        {/* Default Place */}
        {!isEditing && (
          <Checkbox
            checked={formData.is_default || false}
            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
            label="Set as default place"
          />
        )}

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
            {isEditing ? 'Save Changes' : 'Add Place'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
