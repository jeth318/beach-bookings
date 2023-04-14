import { type Booking } from "@prisma/client";

export const today = new Date().getTime();

export const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednsday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const parseTime = (booking: Booking) => {
    const endDate = new Date(
        booking.date.getTime() + booking.duration * 60 * 1000
    );

    const endHour =
        endDate.getHours().toString().length === 1
        ? `0${endDate.getHours()}`
        : endDate.getHours();

    const endMinutes =
        endDate.getMinutes().toString().length === 1
        ? `0${endDate.getMinutes()}`
        : endDate.getMinutes();

    const startHours =
        booking.date.getHours().toString().length > 1
        ? booking.date.getHours()
        : `0${booking.date.getHours()}`;

    const startMinutes =
        booking.date.getMinutes().toString().length > 1
        ? booking.date.getMinutes()
        : `0${booking.date.getMinutes()}`;
  return `${startHours}:${startMinutes} - ${endHour}:${endMinutes}`;
};

export const parseDate = (booking: Booking) => {
    const nameOfTheDay = days[booking.date.getDay()];
    const dayOfTheMonth = booking.date.getDate();
    const month = months[booking.date.getMonth()];
    const str = `${dayOfTheMonth} ${month || ""} - ${nameOfTheDay || ""} `;
    return str;
  };