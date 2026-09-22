/**
 * Modal dialog admin — Bootstrap 5 style, centered overlay.
 * Props: show, title, onClose, children, wide, hideClose
 */
import { useEffect } from "react";

export default function AdminModal({ show, title, onClose, children, wide, hideClose }) {
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${
            wide ? "modal-lg" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-bold mb-0">{title}</h5>
              {!hideClose && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  onClick={onClose}
                />
              )}
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
