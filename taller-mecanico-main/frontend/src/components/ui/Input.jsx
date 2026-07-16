export default function Input({ label, id, type = 'text', value, onChange, required, error, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-3 py-2 rounded-lg border text-sm transition-colors outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-slate-50 disabled:text-slate-400
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
