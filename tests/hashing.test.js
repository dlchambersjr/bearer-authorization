'use script';

import bcrypt from '../src/middleware/hashing.js';

const password = 'testPassword';

describe('Test Hashing Module', () => {
  it('should take a password', () => {

    const hashedPass = bcrypt.hash(password);

    const matchedPass = bcrypt.compare(password, hashedPass);

    expect(matchedPass).toBeTruthy();

  });

});
