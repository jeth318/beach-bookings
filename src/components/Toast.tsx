type Props = {
  level?: string;
  body?: string;
};
export const Toast = ({ body, level = "info" }: Props) => {
  return (
    <div className="smooth-render-in toast-center toast toast-top z-50 p-1">
      <div
        className={`alert alert-${level} w-max text-white shadow-md shadow-black`}
      >
        <p>{body || ""}</p>
      </div>
    </div>
  );
};
