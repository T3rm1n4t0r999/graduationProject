// resources/js/Components/Tooltip.jsx
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

export default function Tooltip({ children, content }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        placement: 'left-start',
        middleware: [offset(8), flip(), shift()],
    });

    return (
        <>
            <span
                ref={refs.setReference}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {children}
            </span>

            {isOpen && createPortal(
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className="z-[9999] p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl text-sm text-main max-w-xs"
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
}
