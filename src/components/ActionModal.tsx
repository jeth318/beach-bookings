type Props = {
  callback: (data: any) => void;
  data?: unknown;
  title: string;
  body?: string;
  tagRef: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
};

export default function ActionModal({
  callback,
  data,
  body,
  title,
  tagRef,
  cancelButtonText,
  confirmButtonText,
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
          {title && <h3 className="text-lg font-bold">{cancelButtonText}</h3>}
          {body && <p className="py-4">{body}</p>}
          <div className="modal-action">
            <div className="btn-group">
              <label htmlFor={`action-modal-${tagRef}`} className="btn ">
                Cancel
              </label>
              <label
                htmlFor={`action-modal-${tagRef}`}
                className="btn-error btn text-white"
                onClick={() => {
                  callback(data);
                }}
              >
                {confirmButtonText}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
