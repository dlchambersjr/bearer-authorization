'use strict';

const hash = (password, salt = 10) => {
  let hashedValue = 0;
  for (var i = 0; i < salt; i++) {
    for (var j = 0; j < password.length; j++) {
      hashedValue += (password.charCodeAt(j) * 256);
    }
  }
  return hashedValue.toString();
};

const compare = (password, storedPass) => {

  const hashedPass = hash(password);

  return (hashedPass === storedPass);

};

export default { hash, compare };