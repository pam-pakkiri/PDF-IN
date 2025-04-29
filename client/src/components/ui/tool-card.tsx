import { ReactNode } from 'react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function ToolCard({ title, description, icon, onClick, disabled = false }: ToolCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center mb-4">
        <div className="mr-3 text-2xl">{icon}</div>
        <h3 className="text-lg font-medium text-neutral-700">{title}</h3>
      </div>
      <p className="text-neutral-500 text-sm mb-6">{description}</p>
      <button 
        className={`w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        {title}
      </button>
    </div>
  );
}
