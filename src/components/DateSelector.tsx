import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const today = new Date(new Date().setDate(new Date().getDate() - 1));

const bookingDateFutureLimit = new Date(
  new Date().setDate(new Date().getDate() + 14)
);

const setHours = (date: Date, hours: number) => {
  const updated = new Date(date);
  updated.setHours(hours);
  return updated;
};

const setMinutes = (minutes: number) => {
  const now = new Date();
  const updated = now.setMinutes(minutes);
  return new Date(updated);
};

const getBookableHours = () => {
  const timeSlots = [];

  for (let i = 9; i <= 21; i++) {
    timeSlots.push(setHours(setMinutes(0), i));
    if (i < 21) {
      timeSlots.push(setHours(setMinutes(30), i));
    }
  }
  return timeSlots;
};

const filterPassedTime = (time: Date) => {
  const currentDate = new Date();
  const selectedDate = new Date(time);

  return currentDate.getTime() < selectedDate.getTime();
};

type Props = {
  date: Date | undefined;
  time?: string;
  callback: (date: Date) => void;
};

const onDateTimeChange = (date: Date, cb: (date: Date) => void) => {
  cb(date);
};

export const DateSelector = ({ date, time, callback }: Props) => {
  return (
    <>
      <label className="label">
        <span className="label-text text-white">
          What date and time are you playing?
        </span>
      </label>

      <div className="custom-datepicker-wrapper">
        <ReactDatePicker
          disabled
          inline
          closeOnScroll={true}
          id="booking-date-picker"
          className={`p-3 ${date && time ? "input-valid" : ""}`}
          showTimeSelect
          selected={date}
          open={true}
          fixedHeight={true}
          placeholderText="Pick date and time"
          timeFormat="HH:mm"
          dateFormat="yyyy-MM-dd - HH:mm"
          filterTime={filterPassedTime}
          includeTimes={getBookableHours()}
          includeDateIntervals={[
            {
              start: today,
              end: bookingDateFutureLimit,
            },
          ]}
          onChange={(date) => onDateTimeChange(date as Date, callback)}
        />
      </div>
    </>
  );
};
