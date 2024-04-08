import moment from 'moment';

export const generateOTP = () => {
  const otpLength = 6;
  let otp = '';

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return {
    otp: otp,
    expiration_time: moment(new Date()).add(2, 'm'),
  };
};
