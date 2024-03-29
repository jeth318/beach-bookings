type Props = {
  stroke?: string;
  width?: string;
  height?: string;
  fill?: string;
};

type DynamicSvgProps = {
  name: string;
  stroke?: string;
  width?: string;
  height?: string;
  fill?: string;
};

export const DynamicSvg = (props: DynamicSvgProps) => {
  const iconProps = {
    stroke: props.stroke,
    width: props.width,
    height: props.height,
    fill: props.fill,
  };

  switch (props.name) {
    case "settings":
      return SettingsIcon(iconProps);
    case "log-out":
      return LogoutIcon(iconProps);
    case "how-to":
      return HowToIcon(iconProps);
    case "booking-added":
      return BookingAddedIcon(iconProps);
    case "booking-modified":
      return BookingModifiedIcon(iconProps);
    case "booking-removed":
      return BookingRemovedIcon(iconProps);
    case "user-left":
      return UserLeftIcon(iconProps);
    case "user-joined":
      return PlayerJoinedIcon(iconProps);
    case "user-kicked":
      return PlayerKickedIcon(iconProps);
    default:
      return <div></div>;
  }
};

const LogoutIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      width={width}
      height={height}
      fill={fill}
      className={stroke}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Interface / Log_Out">
        <path
          id="Vector"
          d="M12 15L15 12M15 12L12 9M15 12H4M9 7.24859V7.2002C9 6.08009 9 5.51962 9.21799 5.0918C9.40973 4.71547 9.71547 4.40973 10.0918 4.21799C10.5196 4 11.0801 4 12.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H12.1969C11.079 20 10.5192 20 10.0918 19.7822C9.71547 19.5905 9.40973 19.2839 9.21799 18.9076C9 18.4798 9 17.9201 9 16.8V16.75"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

const SettingsIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Interface / Settings">
        <g id="Vector">
          <path
            d="M20.3499 8.92293L19.9837 8.7192C19.9269 8.68756 19.8989 8.67169 19.8714 8.65524C19.5983 8.49165 19.3682 8.26564 19.2002 7.99523C19.1833 7.96802 19.1674 7.93949 19.1348 7.8831C19.1023 7.82677 19.0858 7.79823 19.0706 7.76998C18.92 7.48866 18.8385 7.17515 18.8336 6.85606C18.8331 6.82398 18.8332 6.79121 18.8343 6.72604L18.8415 6.30078C18.8529 5.62025 18.8587 5.27894 18.763 4.97262C18.6781 4.70053 18.536 4.44993 18.3462 4.23725C18.1317 3.99685 17.8347 3.82534 17.2402 3.48276L16.7464 3.1982C16.1536 2.85658 15.8571 2.68571 15.5423 2.62057C15.2639 2.56294 14.9765 2.56561 14.6991 2.62789C14.3859 2.69819 14.0931 2.87351 13.5079 3.22396L13.5045 3.22555L13.1507 3.43741C13.0948 3.47091 13.0665 3.48779 13.0384 3.50338C12.7601 3.6581 12.4495 3.74365 12.1312 3.75387C12.0992 3.7549 12.0665 3.7549 12.0013 3.7549C11.9365 3.7549 11.9024 3.7549 11.8704 3.75387C11.5515 3.74361 11.2402 3.65759 10.9615 3.50224C10.9334 3.48658 10.9056 3.46956 10.8496 3.4359L10.4935 3.22213C9.90422 2.86836 9.60915 2.69121 9.29427 2.62057C9.0157 2.55807 8.72737 2.55634 8.44791 2.61471C8.13236 2.68062 7.83577 2.85276 7.24258 3.19703L7.23994 3.1982L6.75228 3.48124L6.74688 3.48454C6.15904 3.82572 5.86441 3.99672 5.6517 4.23614C5.46294 4.4486 5.32185 4.69881 5.2374 4.97018C5.14194 5.27691 5.14703 5.61896 5.15853 6.3027L5.16568 6.72736C5.16676 6.79166 5.16864 6.82362 5.16817 6.85525C5.16343 7.17499 5.08086 7.48914 4.92974 7.77096C4.9148 7.79883 4.8987 7.8267 4.86654 7.88237C4.83436 7.93809 4.81877 7.96579 4.80209 7.99268C4.63336 8.26452 4.40214 8.49186 4.12733 8.65572C4.10015 8.67193 4.0715 8.68752 4.01521 8.71871L3.65365 8.91908C3.05208 9.25245 2.75137 9.41928 2.53256 9.65669C2.33898 9.86672 2.19275 10.1158 2.10349 10.3872C2.00259 10.6939 2.00267 11.0378 2.00424 11.7255L2.00551 12.2877C2.00706 12.9708 2.00919 13.3122 2.11032 13.6168C2.19979 13.8863 2.34495 14.134 2.53744 14.3427C2.75502 14.5787 3.05274 14.7445 3.64974 15.0766L4.00808 15.276C4.06907 15.3099 4.09976 15.3266 4.12917 15.3444C4.40148 15.5083 4.63089 15.735 4.79818 16.0053C4.81625 16.0345 4.8336 16.0648 4.8683 16.1255C4.90256 16.1853 4.92009 16.2152 4.93594 16.2452C5.08261 16.5229 5.16114 16.8315 5.16649 17.1455C5.16707 17.1794 5.16658 17.2137 5.16541 17.2827L5.15853 17.6902C5.14695 18.3763 5.1419 18.7197 5.23792 19.0273C5.32287 19.2994 5.46484 19.55 5.65463 19.7627C5.86915 20.0031 6.16655 20.1745 6.76107 20.5171L7.25478 20.8015C7.84763 21.1432 8.14395 21.3138 8.45869 21.379C8.73714 21.4366 9.02464 21.4344 9.30209 21.3721C9.61567 21.3017 9.90948 21.1258 10.4964 20.7743L10.8502 20.5625C10.9062 20.5289 10.9346 20.5121 10.9626 20.4965C11.2409 20.3418 11.5512 20.2558 11.8695 20.2456C11.9015 20.2446 11.9342 20.2446 11.9994 20.2446C12.0648 20.2446 12.0974 20.2446 12.1295 20.2456C12.4484 20.2559 12.7607 20.3422 13.0394 20.4975C13.0639 20.5112 13.0885 20.526 13.1316 20.5519L13.5078 20.7777C14.0971 21.1315 14.3916 21.3081 14.7065 21.3788C14.985 21.4413 15.2736 21.4438 15.5531 21.3855C15.8685 21.3196 16.1657 21.1471 16.7586 20.803L17.2536 20.5157C17.8418 20.1743 18.1367 20.0031 18.3495 19.7636C18.5383 19.5512 18.6796 19.3011 18.764 19.0297C18.8588 18.7252 18.8531 18.3858 18.8417 17.7119L18.8343 17.2724C18.8332 17.2081 18.8331 17.1761 18.8336 17.1445C18.8383 16.8247 18.9195 16.5104 19.0706 16.2286C19.0856 16.2007 19.1018 16.1726 19.1338 16.1171C19.166 16.0615 19.1827 16.0337 19.1994 16.0068C19.3681 15.7349 19.5995 15.5074 19.8744 15.3435C19.9012 15.3275 19.9289 15.3122 19.9838 15.2818L19.9857 15.2809L20.3472 15.0805C20.9488 14.7472 21.2501 14.5801 21.4689 14.3427C21.6625 14.1327 21.8085 13.8839 21.8978 13.6126C21.9981 13.3077 21.9973 12.9658 21.9958 12.2861L21.9945 11.7119C21.9929 11.0287 21.9921 10.6874 21.891 10.3828C21.8015 10.1133 21.6555 9.86561 21.463 9.65685C21.2457 9.42111 20.9475 9.25526 20.3517 8.92378L20.3499 8.92293Z"
            className={stroke}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00033 12C8.00033 14.2091 9.79119 16 12.0003 16C14.2095 16 16.0003 14.2091 16.0003 12C16.0003 9.79082 14.2095 7.99996 12.0003 7.99996C9.79119 7.99996 8.00033 9.79082 8.00033 12Z"
            className={stroke}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
};

const HowToIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="icomoon-ignore"></g>
      <path d="M16 2.672c-7.361 0-13.328 5.967-13.328 13.328s5.967 13.328 13.328 13.328 13.328-5.967 13.328-13.328c0-7.361-5.967-13.328-13.328-13.328zM16 28.262c-6.761 0-12.262-5.5-12.262-12.262s5.5-12.262 12.262-12.262 12.262 5.5 12.262 12.262c0 6.761-5.5 12.262-12.262 12.262z"></path>
      <path d="M15.955 9.013c-2.706 0-4.217 1.672-4.236 4.322h1.176c-0.037-1.922 0.97-3.332 3.005-3.332 1.455 0 2.668 1.026 2.668 2.519 0 0.97-0.523 1.754-1.213 2.407-1.418 1.316-1.815 1.935-1.887 3.738h1.191c0.070-1.635 0.034-1.602 1.461-3.029 0.952-0.896 1.623-1.792 1.623-3.173 0-2.164-1.717-3.452-3.787-3.452z"></path>
      <path d="M16 20.799c-0.588 0-1.066 0.477-1.066 1.066 0 0.589 0.478 1.066 1.066 1.066s1.066-0.477 1.066-1.066c0-0.588-0.477-1.066-1.066-1.066z"></path>
    </svg>
  );
};

const BookingAddedIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Edit / Add_Plus_Square">
        <path
          id="Vector"
          d="M8 12H12M12 12H16M12 12V16M12 12V8M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4801 4 18.9079 4.21799C19.2842 4.40973 19.5905 4.71547 19.7822 5.0918C20.0002 5.51962 20.0002 6.07967 20.0002 7.19978V16.7998C20.0002 17.9199 20.0002 18.48 19.7822 18.9078C19.5905 19.2841 19.2842 19.5905 18.9079 19.7822C18.4805 20 17.9215 20 16.8036 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

const BookingRemovedIcon = ({
  stroke,
  width,
  height,
  fill = "none",
}: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Edit / Add_Minus_Square">
        <path
          id="Vector"
          d="M8 12H16M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4801 4 18.9079 4.21799C19.2842 4.40973 19.5905 4.71547 19.7822 5.0918C20.0002 5.51962 20.0002 6.07967 20.0002 7.19978V16.7998C20.0002 17.9199 20.0002 18.48 19.7822 18.9078C19.5905 19.2841 19.2842 19.5905 18.9079 19.7822C18.4805 20 17.9215 20 16.8036 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

const BookingModifiedIcon = ({
  stroke,
  width,
  height,
  fill = "none",
}: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z"
        stroke={stroke}
        strokeWidth="1"
      />
      <path
        d="M16.2739 11.1377C16.6644 10.7472 16.6644 10.114 16.2739 9.7235L14.4823 7.9319C14.0918 7.54137 13.4586 7.54138 13.0681 7.9319L8.96106 12.0389L8.34768 15.7477C8.3365 15.8154 8.39516 15.874 8.4628 15.8627L12.1669 15.2448L16.2739 11.1377Z"
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
};

const UserLeftIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle fill={fill} stroke={stroke} cx="9.61" cy="5.8" r="4.3" />
      <path
        fill={fill}
        stroke={stroke}
        d="M1.5,19.64l.7-3.47a7.56,7.56,0,0,1,7.41-6.08,7.43,7.43,0,0,1,4.59,1.57"
      />
      <circle fill={fill} stroke={stroke} cx="16.77" cy="16.77" r="5.73" />
      <line
        fill={fill}
        stroke={stroke}
        x1="13.91"
        y1="16.77"
        x2="19.64"
        y2="16.77"
      />
    </svg>
  );
};

const PlayerKickedIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 52 52"
      enableBackground="new 0 0 52 52"
    >
      <g>
        <path
          strokeWidth="1"
          d="M25.7,22.4c-0.5,0.7-0.2,1.7,0.6,2.2c1.6,0.9,3.4,1.9,4.9,3.3c2.5-1.9,5.5-3,8.8-3.2
		c-1.1-1.9-3.4-3.2-5.8-4.3c-2.3-1-2.8-1.9-2.8-3c0-1,0.7-1.9,1.4-2.8c1.4-1.3,2.1-3.1,2.1-5.3c0.1-4-2.2-7.5-6.4-7.5
		c-2.5,0-4.2,1.3-5.4,3.1c2.9,2.2,4.6,6,4.6,10.3C27.6,18,26.9,20.4,25.7,22.4z"
        />
        <path
          strokeWidth="1"
          d="M31.8,34.7l6,6l-6,6c-0.6,0.6-0.6,1.6,0,2.1l0.7,0.7c0.6,0.6,1.6,0.6,2.1,0l6-6l6,6c0.6,0.6,1.6,0.6,2.1,0
		l0.7-0.7c0.6-0.6,0.6-1.6,0-2.1l-6-6l6-6c0.6-0.6,0.6-1.6,0-2.1l-0.7-0.7c-0.6-0.6-1.6-0.6-2.1,0l-6,6l-6-6c-0.6-0.6-1.6-0.6-2.1,0
		l-0.7,0.7C31.3,33.1,31.3,34.1,31.8,34.7z"
        />
        <path
          strokeWidth="1"
          d="M28.2,30.7c-1.4-1.4-3.5-2.3-5.6-3.3c-2.6-1.1-3-2.2-3-3.3c0-1.1,0.7-2.3,1.6-3.1c1.5-1.5,2.3-3.6,2.3-6
		c0-4.5-2.6-8.4-7.2-8.4h-0.5c-4.6,0-7.2,3.9-7.2,8.4c0,2.4,0.8,4.5,2.3,6c0.9,0.8,1.6,1.9,1.6,3.1c0,1.1-0.3,2.2-3,3.3
		c-3.8,1.7-7.3,3.4-7.5,7c0.2,2.5,1.9,4.4,4.1,4.4h18.6C25.2,35.7,26.4,32.9,28.2,30.7z"
        />
      </g>
    </svg>
  );
};

const PlayerJoinedIcon = ({ stroke, width, height, fill = "none" }: Props) => {
  return (
    <svg
      className={stroke}
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle fill={fill} stroke={stroke} cx="9.61" cy="5.8" r="4.3" />
      <path
        fill={fill}
        stroke={stroke}
        d="M1.5,19.64l.7-3.47a7.56,7.56,0,0,1,7.41-6.08,7.43,7.43,0,0,1,4.59,1.57"
      />
      <circle fill={fill} stroke={stroke} cx="16.77" cy="16.77" r="5.73" />
      <line
        fill={fill}
        stroke={stroke}
        x1="13.91"
        y1="16.77"
        x2="19.64"
        y2="16.77"
      />
      <line
        fill={fill}
        stroke={stroke}
        x1="16.77"
        y1="13.91"
        x2="16.77"
        y2="19.64"
      />
    </svg>
  );
};
