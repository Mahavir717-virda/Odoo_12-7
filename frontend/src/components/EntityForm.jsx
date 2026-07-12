import React from 'react';

export default function EntityForm({ fields = [], formData = {}, onChange, onSubmit, buttonText = "Submit", buttonColorClass = "bg-brand text-bg-base" }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            >
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-brand"
            />
          ) : (
            <input
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-brand"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className={`w-full py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${buttonColorClass}`}
      >
        {buttonText}
      </button>
    </form>
  );
}
