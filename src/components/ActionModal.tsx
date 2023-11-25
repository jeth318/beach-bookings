import { useRef, type MutableRefObject, type ReactNode } from "react";

type Props = {
  callback: (data: any) => void;
  data?: unknown;
  children?: ReactNode;
  html?: string;
  title: string;
  body?: string;
  tagRef: string;
  modalRef?: MutableRefObject<HTMLInputElement | null>;
  cancelButtonText?: string;
  confirmButtonText?: string;
  level?: string;
  forceOpen?: boolean;
  hideConfirm?: boolean;
  hideCancel?: boolean;
};

export default function ActionModal({
  callback,
  data,
  children,
  body,
  title,
  tagRef,
  cancelButtonText,
  confirmButtonText,
  hideConfirm,
  hideCancel,
  forceOpen,
  modalRef,
  level = "error",
}: Props) {
  return (
    <div>
      <input
        type="checkbox"
        id={`action-modal-${tagRef}`}
        ref={modalRef}
        className="modal-toggle"
      />
      <div
        className={`modal modal-bottom sm:modal-middle ${
          forceOpen ? "modal-open" : ""
        }`}
      >
        <div className="modal-box">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {body && <p className="py-4">{body}</p>}
          {children && children}
          <div className="modal-action">
            <div className="btn-group">
              {!hideCancel && (
                <label htmlFor={`action-modal-${tagRef}`} className="btn ">
                  {cancelButtonText || "Cancel"}
                </label>
              )}
              {!hideConfirm && (
                <label
                  htmlFor={`action-modal-${tagRef}`}
                  className={`btn-${level} btn`}
                  onClick={() => {
                    callback(data);
                  }}
                >
                  {confirmButtonText || "Confirm"}
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
