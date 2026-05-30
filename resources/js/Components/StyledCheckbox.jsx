export default function StyledCheckbox({ checked, onChange, disabled = false }) {
    return (
        <label className="relative flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
            />
            <span
                className={`
                    inline-flex items-center justify-center w-5 h-5
                    transition-all duration-200 border-2 rounded-md
                    peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                    ${
                    checked
                        ? 'bg-primary-light border-primary text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-primary/50'
                }
                `}
            >
                {checked && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </span>
        </label>
    );
}
