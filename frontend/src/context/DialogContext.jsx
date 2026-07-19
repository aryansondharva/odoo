import { createContext, useContext, useRef, useState } from 'react';
import Modal from '../components/Modal';

const DialogContext = createContext(null);

const actionStyles = {
    primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus:ring-cyan-300',
    danger: 'bg-rose-400 text-rose-950 hover:bg-rose-300 focus:ring-rose-300',
};

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);
    const inputRef = useRef(null);
    const resolverRef = useRef(null);

    const settle = (value) => {
        resolverRef.current?.(value);
        resolverRef.current = null;
        setDialog(null);
    };

    const openDialog = (nextDialog) => new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialog(nextDialog);
    });

    const showNotice = ({ title = 'Notice', description, actionLabel = 'Done' }) => (
        openDialog({ type: 'notice', title, description, actionLabel })
    );

    const showConfirm = ({
        title = 'Confirm action',
        description,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        tone = 'primary',
    }) => (
        openDialog({ type: 'confirm', title, description, confirmLabel, cancelLabel, tone })
    );

    const showPrompt = ({
        title = 'Add a note',
        description,
        label = 'Note',
        placeholder = 'Write a note…',
        defaultValue = '',
        confirmLabel = 'Save note',
        cancelLabel = 'Cancel',
    }) => (
        openDialog({
            type: 'prompt',
            title,
            description,
            label,
            placeholder,
            value: defaultValue,
            confirmLabel,
            cancelLabel,
        })
    );

    const closeDialog = () => {
        settle(dialog?.type === 'confirm' ? false : null);
    };

    const confirmDialog = () => {
        if (dialog?.type === 'confirm') settle(true);
        else if (dialog?.type === 'prompt') settle(dialog.value.trim() || null);
        else settle(true);
    };

    return (
        <DialogContext.Provider value={{ showNotice, showConfirm, showPrompt }}>
            {children}
            <Modal
                open={Boolean(dialog)}
                onClose={closeDialog}
                title={dialog?.title || ''}
                description={dialog?.description}
                size="sm"
                initialFocusRef={dialog?.type === 'prompt' ? inputRef : undefined}
                footer={dialog?.type === 'notice' ? (
                    <button
                        type="button"
                        data-modal-autofocus
                        onClick={confirmDialog}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        {dialog?.actionLabel || 'Done'}
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            data-modal-autofocus={dialog?.type === 'confirm' ? true : undefined}
                            onClick={closeDialog}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {dialog?.cancelLabel || 'Cancel'}
                        </button>
                        <button
                            type="button"
                            onClick={confirmDialog}
                            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${actionStyles[dialog?.tone] || actionStyles.primary}`}
                        >
                            {dialog?.confirmLabel || 'Confirm'}
                        </button>
                    </>
                )}
            >
                {dialog?.type === 'prompt' ? (
                    <label className="block">
                        <span className="text-sm font-medium text-slate-200">{dialog.label}</span>
                        <textarea
                            ref={inputRef}
                            value={dialog.value}
                            onChange={(event) => setDialog((current) => ({ ...current, value: event.target.value }))}
                            placeholder={dialog.placeholder}
                            rows={4}
                            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                        />
                    </label>
                ) : (
                    <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                        <p className="text-sm leading-6 text-slate-200">
                            {dialog?.type === 'confirm'
                                ? 'Review the details, then confirm when you are ready. This change may take effect immediately.'
                                : 'You can safely close this message and continue working.'}
                        </p>
                    </div>
                )}
            </Modal>
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('useDialog must be used within DialogProvider.');
    return context;
};
