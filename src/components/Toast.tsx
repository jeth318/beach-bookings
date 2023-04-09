type Props = {
  body?: string;
};
export const Toast = ({ body }: Props) => {
  return (
    <div className="toast-center toast toast-top z-50 p-1">
      <div className="alert alert-info w-max text-white shadow-md shadow-black">
        <p>{body || "Removed player"}</p>
      </div>
    </div>
  );
};
