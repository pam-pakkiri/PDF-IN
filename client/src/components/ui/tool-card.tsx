import { ReactNode } from 'react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  category?: string;
  featured?: boolean;
}

export function ToolCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false, 
  category,
  featured = false
}: ToolCardProps) {
  return (
    <div className={`group relative bg-white rounded-lg ${featured ? 'shadow-lg border-2 border-primary/20' : 'shadow-md'} 
      hover:shadow-xl transition-all duration-300 p-6 overflow-hidden`}>
      {/* Glass effect decorative element */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all duration-300"></div>
      
      {/* Category badge */}
      {category && (
        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {category}
        </span>
      )}
      
      {/* Featured badge */}
      {featured && (
        <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium">
          Featured
        </span>
      )}
      
      <div className="flex flex-col items-start">
        <div className="p-2 mb-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
          <div className="text-2xl">{icon}</div>
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-neutral-500 text-sm mb-6">{description}</p>
        <button 
          className={`w-full py-2.5 rounded-md transition-all duration-300 ${
            disabled 
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-blue-700 text-white hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5'
          }`}
          onClick={onClick}
          disabled={disabled}
        >
          <span className="flex items-center justify-center">
            {title}
            {!disabled && <span className="material-icons text-sm ml-1">arrow_forward</span>}
          </span>
        </button>
      </div>
    </div>
  );
}
