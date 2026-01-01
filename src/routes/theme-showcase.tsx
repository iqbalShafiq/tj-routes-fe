import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/theme-showcase')({
  component: ThemeShowcase,
});

interface BorderStyle {
  id: string;
  name: string;
  description: string;
  cardClass: string;
  buttonClass: string;
  inputClass: string;
}

const borderStyles: BorderStyle[] = [
  {
    id: 'current',
    name: 'Current (Chamfered)',
    description: 'The current chamfered corner style using clip-path',
    cardClass: 'card-chamfered',
    buttonClass: 'card-chamfered-sm',
    inputClass: 'input-refined',
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric Rounded',
    description: 'Different border-radius values per corner for a unique look',
    cardClass: 'card-asymmetric',
    buttonClass: 'button-asymmetric',
    inputClass: 'input-asymmetric',
  },
  {
    id: 'soft-rounded',
    name: 'Soft Rounded with Depth',
    description: 'Standard rounded corners with subtle inner shadows for depth',
    cardClass: 'card-soft-rounded',
    buttonClass: 'button-soft-rounded',
    inputClass: 'input-soft-rounded',
  },
  {
    id: 'minimal',
    name: 'Minimal Squared',
    description: 'Very subtle rounding (2-4px) for a modern, clean look',
    cardClass: 'card-minimal',
    buttonClass: 'button-minimal',
    inputClass: 'input-minimal',
  },
  {
    id: 'accent-border',
    name: 'Rounded with Accent Border',
    description: 'Standard rounded with colored top border accent',
    cardClass: 'card-accent-border',
    buttonClass: 'button-accent-border',
    inputClass: 'input-accent-border',
  },
  {
    id: 'notched',
    name: 'Rounded with Notch',
    description: 'Rounded corners with a small decorative notch at top-left',
    cardClass: 'card-notched',
    buttonClass: 'button-notched',
    inputClass: 'input-notched',
  },
  {
    id: 'gradient-border',
    name: 'Rounded with Gradient Border',
    description: 'Standard rounded with gradient border effect',
    cardClass: 'card-gradient-border',
    buttonClass: 'button-gradient-border',
    inputClass: 'input-gradient-border',
  },
  {
    id: 'offset-shadow',
    name: 'Rounded with Offset Shadow',
    description: 'Standard rounded with directional shadow for depth',
    cardClass: 'card-offset-shadow',
    buttonClass: 'button-offset-shadow',
    inputClass: 'input-offset-shadow',
  },
];

function ThemeShowcase() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleSelectStyle = (styleId: string) => {
    setSelectedStyle(styleId);
    // In a real implementation, this would apply the style globally
    console.log(`Selected style: ${styleId}`);
  };

  return (
    <div className="min-h-screen bg-bg-main py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Border Style Theme Showcase
          </h1>
          <p className="text-text-secondary text-lg">
            Explore different border style options for cards, buttons, and forms.
            Each option maintains your brand identity while offering a more familiar user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {borderStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={selectedStyle === style.id}
              onSelect={() => handleSelectStyle(style.id)}
            />
          ))}
        </div>

        {selectedStyle && (
          <div className="mt-8 p-6 bg-tertiary/10 border border-tertiary rounded-xl">
            <h2 className="text-xl font-display font-semibold text-tertiary mb-2">
              Style Selected: {borderStyles.find(s => s.id === selectedStyle)?.name}
            </h2>
            <p className="text-text-primary mb-4">
              To apply this style across the application, update the component classes:
            </p>
            <div className="bg-bg-surface p-4 rounded-lg font-mono text-sm">
              <div className="mb-2">
                <span className="text-text-secondary">Card:</span>{' '}
                <span className="text-text-primary">.{borderStyles.find(s => s.id === selectedStyle)?.cardClass}</span>
              </div>
              <div className="mb-2">
                <span className="text-text-secondary">Button:</span>{' '}
                <span className="text-text-primary">.{borderStyles.find(s => s.id === selectedStyle)?.buttonClass}</span>
              </div>
              <div>
                <span className="text-text-secondary">Input:</span>{' '}
                <span className="text-text-primary">.{borderStyles.find(s => s.id === selectedStyle)?.inputClass}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StyleCardProps {
  style: BorderStyle;
  isSelected: boolean;
  onSelect: () => void;
}

function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <div className="bg-bg-surface p-6 rounded-xl shadow-md border border-border">
      <div className="mb-4">
        <h2 className="text-2xl font-display font-semibold text-text-primary mb-1">
          {style.name}
        </h2>
        <p className="text-text-secondary text-sm">{style.description}</p>
      </div>

      {/* Card Example */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-2 font-display">Card Example</h3>
        <div
          className={`
            ${style.cardClass}
            ${style.id !== 'gradient-border' ? 'bg-bg-surface shadow-md border border-border' : ''}
            transition-all duration-300
            p-6 hover:shadow-lg hover:-translate-y-0.5
            ${style.id !== 'gradient-border' ? 'hover:border-tertiary' : ''}
            ${style.id === 'offset-shadow' ? 'hover:border-tertiary' : ''}
          `}
        >
          <div className={`relative ${style.id === 'notched' ? 'z-10' : 'z-0'}`}>
            <h4 className="font-display font-semibold text-text-primary mb-2">Sample Card Title</h4>
            <p className="text-text-secondary text-sm">
              This is an example card demonstrating the {style.name.toLowerCase()} border style.
              Hover over it to see the interaction effects.
            </p>
          </div>
        </div>
      </div>

      {/* Button Examples */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-2 font-display">Button Examples</h3>
        <div className="flex flex-wrap gap-3">
          <button
            className={`
              ${style.buttonClass}
              font-display font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98] inline-flex items-center justify-center
              bg-text-primary text-white hover:bg-text-secondary
              focus:ring-text-muted
              ${style.id === 'offset-shadow' ? '' : 'shadow-sm hover:shadow-md'}
              ${style.id === 'gradient-border' ? 'relative z-0' : ''}
              px-6 py-3 text-base
            `}
          >
            Primary Button
          </button>
          <button
            className={`
              ${style.buttonClass}
              font-display font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98] inline-flex items-center justify-center
              bg-tertiary text-white hover:bg-tertiary-hover
              focus:ring-tertiary
              ${style.id === 'offset-shadow' ? '' : 'shadow-sm hover:shadow-md'}
              ${style.id === 'gradient-border' ? 'relative z-0' : ''}
              px-6 py-3 text-base
            `}
          >
            Accent Button
          </button>
          <button
            className={`
              ${style.buttonClass}
              font-display font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98] inline-flex items-center justify-center
              bg-transparent border-2 border-border text-text-secondary
              hover:border-text-muted hover:bg-bg-main focus:ring-text-muted
              ${style.id === 'offset-shadow' ? '' : ''}
              ${style.id === 'gradient-border' ? 'relative z-0' : ''}
              px-6 py-3 text-base
            `}
          >
            Outline Button
          </button>
        </div>
      </div>

      {/* Form Input Examples */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-2 font-display">Form Input Examples</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-display">
              Text Input
            </label>
            <input
              type="text"
              placeholder="Enter text here..."
              className={`
                ${style.inputClass}
                w-full px-4 py-3
                ${style.id !== 'gradient-border' ? 'border-2 border-border bg-bg-surface' : 'bg-bg-surface'}
                text-text-primary placeholder:text-text-muted
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary
                ${style.id !== 'gradient-border' ? 'hover:border-text-muted' : ''}
                ${style.id === 'gradient-border' ? 'relative z-0' : ''}
              `}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-display">
              Textarea
            </label>
            <textarea
              placeholder="Enter longer text here..."
              rows={3}
              className={`
                ${style.inputClass}
                w-full px-4 py-3 resize-none
                ${style.id !== 'gradient-border' ? 'border-2 border-border bg-bg-surface' : 'bg-bg-surface'}
                text-text-primary placeholder:text-text-muted
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary
                ${style.id !== 'gradient-border' ? 'hover:border-text-muted' : ''}
                ${style.id === 'gradient-border' ? 'relative z-0' : ''}
              `}
            />
          </div>
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={onSelect}
        className={`
          w-full py-3 px-4 rounded-lg font-display font-medium
          transition-all duration-200
          ${isSelected
            ? 'bg-tertiary text-white hover:bg-tertiary-hover'
            : 'bg-bg-elevated text-text-secondary hover:bg-border'
          }
        `}
      >
        {isSelected ? '✓ Selected' : 'Select This Style'}
      </button>
    </div>
  );
}

