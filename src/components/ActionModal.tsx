type Props = {
  callback: (data: any) => void;
  data?: unknown;
  title: string;
  body?: string;
  tagRef: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  level?: string;
};

export default function ActionModal({
  callback,
  data,
  body,
  title,
  tagRef,
  cancelButtonText,
  confirmButtonText,
  level = "error",
}: Props) {
  return (
    <div>
      {/* Put this part before </body> tag */}
      <input
        type="checkbox"
        id={`action-modal-${tagRef}`}
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {body && <p className="py-4">{body}</p>}
          <div className="modal-action">
            <div className="btn-group">
              <label htmlFor={`action-modal-${tagRef}`} className="btn ">
                {cancelButtonText || "Cancel"}
              </label>
              <label
                htmlFor={`action-modal-${tagRef}`}
                className={`btn-${level} btn text-white`}
                onClick={() => {
                  callback(data);
                }}
              >
                {confirmButtonText || "Confirm"}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
