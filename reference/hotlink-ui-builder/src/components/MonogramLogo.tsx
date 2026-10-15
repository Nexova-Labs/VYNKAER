import React from 'react';

interface MonogramLogoProps {
  className?: string;
  size?: number;
}

export const MonogramLogo: React.FC<MonogramLogoProps> = ({ className = 'h-8 w-auto', size = 32 }) => {
  const [hasError, setHasError] = React.useState(false);

  const hotlinkUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1WPRf_WC2HxxetzMwaCUqMRyDF6u4jBEzc5Kf2bpCWbOzbZYi9JzE21qT3hB4blXinU-8Q7lM_zgKL44OKgCcQxsSRG_YKEYKHzZbDKBFat8Wxl0V2A9i2sJifYiYKFiKr-WzuTkRSdX-JulAH8XgUDnk1tTCzk1-71qBoduUEw1QfejNk2o7QGkH7a7y3JsxJVLC2vOnh4UAG-TFIsU0nc6MqwUdBhlFGc3AYdgxgmaBlFs9Vya9lN37aU';

  if (hasError) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
      >
        <rect width="100" height="100" rx="22" fill="#131314" stroke="#26262C" strokeWidth="2" />
        {/* Dot */}
        <circle cx="50" cy="26" r="3.5" fill="#975a36" />
        {/* V Chevron */}
        <path
          d="M 26 31 L 50 74 L 74 31"
          stroke="#e5e2e3"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 39 52 L 50 74 L 61 52"
          stroke="#975a36"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <img
      src={hotlinkUrl}
      alt="VYNKÆR Monogram Mark"
      className={`${className} object-contain`}
      style={{ height: size, width: 'auto' }}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
