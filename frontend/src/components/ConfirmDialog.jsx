function ConfirmDialog({
                           open,
                           title = "Confirm Delete",
                           message = "Are you sure you want to delete this item?",
                           confirmText = "Delete",
                           cancelText = "Cancel",
                           onConfirm,
                           onCancel,
                       }) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--app-card)] p-6 shadow-2xl">
                <h2
                    id="confirm-dialog-title"
                    className="text-lg font-semibold text-[var(--app-text)]"
                >
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--app-secondary-text)]">
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-[var(--app-text)] transition hover:bg-white/5"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
