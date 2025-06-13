const generateOtp = () => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  return otp;
};

const handleDate = () => {
  const time = Date.now();
  const date = new Date(time);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" }); // e.g., "May"
  const year = date.getFullYear();

  const getDaySuffix = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formattedDate = `${day}${getDaySuffix(day)} ${month} ${year}`;
  return formattedDate;
};

const filterUserData = (user) => {
  return userInfo;
};

export { generateOtp, handleDate, filterUserData };
