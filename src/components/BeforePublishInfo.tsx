import { JoinableToggle } from "./JoinableToggle";

type Props = {
  joinable: boolean;
  isLoading: boolean | undefined;
  callback: () => void;
};
export const BeforePublishInfo = ({ joinable, isLoading, callback }: Props) => {
  return (
    <div className="py-4">
      <p>
        All players with notifications enabled will receive an email about the
        new booking.
      </p>
      <br />
      <p>
        By default, the booking is open for people to join. If you want to
        prevent others from joining right now, use the toggle below. You can
        change this setting later anytime.
      </p>
      <JoinableToggle
        value={joinable}
        isLoading={isLoading}
        callback={callback}
      />
    </div>
  );
};
