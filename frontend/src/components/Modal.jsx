import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
};

const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Premium, accessible dark-mode dialog for dashboard workflows.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size]
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 */
const Modal = ({
    open,
    onClose,
    title,
    description,
    size = 'md',
    footer,
    children,
    closeOnBackdrop = true,
    closeOnEsc = true,
    showCloseButton = true,
    initialFocusRef,
}) => {
    const [isMounted, setIsMounted] = useState(open);
    const [isVisible, setIsVisible] = useState(open);
    const dialogRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (open) {
            setIsMounted(true);
            const frame = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(frame);
        }

        setIsVisible(false);
        const timeout = window.setTimeout(() => setIsMounted(false), 180);
        return () => window.clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        if (!isMounted || !isVisible) return undefined;

        const previousActiveElement = document.activeElement;
        const focusTarget = initialFocusRef?.current
            || dialogRef.current?.querySelector('[data-modal-autofocus]')
            || dialogRef.current;
        focusTarget?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && closeOnEsc) {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusableElements = [...dialogRef.current.querySelectorAll(focusableSelector)];
            if (!focusableElements.length) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousActiveElement?.focus?.();
        };
    }, [closeOnEsc, initialFocusRef, isMounted, isVisible, onClose]);

    if (!isMounted || typeof document === 'undefined') return null;

    const requestClose = () => {
        if (isVisible) onClose();
    };

    return createPortal(
        <div
            className={`fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:items-center sm:p-6 transition-opacity duration-200 motion-reduce:transition-none ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onMouseDown={(event) => {
                if (closeOnBackdrop && event.target === event.currentTarget) requestClose();
            }}
        >
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" aria-hidden="true" />
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`relative z-10 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl shadow-black/50 ring-1 ring-white/5 transition-all duration-200 motion-reduce:transition-none ${sizes[size] || sizes.md} ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.98] opacity-0'}`}
            >
                <header className="flex shrink-0 items-start justify-between gap-6 border-b border-white/10 px-6 py-5 sm:px-7">
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
                        {description && <p id={descriptionId} className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
                    </div>
                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={requestClose}
                            aria-label="Close dialog"
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            <X size={18} strokeWidth={2} aria-hidden="true" />
                        </button>
                    )}
                </header>

                <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-7">{children}</div>

                {footer && (
                    <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                        {footer}
                    </footer>
                )}
            </section>
        </div>,
        document.body,
    );
};

export default Modal;
