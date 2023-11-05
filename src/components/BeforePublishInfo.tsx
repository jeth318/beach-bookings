import { JoinableToggle } from "./JoinableToggle";

type Props = {
  joinable: boolean;
  isLoading: boolean | undefined;
  callback: () => void;
};
export const BeforePublishInfo = ({ joinable, isLoading, callback }: Props) => {
  return (
    <div>
      <p>
        All players with notifications enabled will receive an email about the
        new booking.
      </p>
    </div>
  );
};
