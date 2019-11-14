/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file User controller - manages login and logout
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import Controller from './controller';

export default class extends Controller {
  constructor(username = 'anonymous', isLoggedIn = false) {
    super();
    this.username = username;
    this.isLoggedIn = isLoggedIn;
  }

  authenticate(username, password) {
    let urlEncodedData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    urlEncodedData = urlEncodedData.replace(/%20/g, '+');
    return this.ajax('POST', '/api/login', urlEncodedData).then((data) => {
      const user = data;
      if (user.loggedIn === true) {
        this.username = user.username;
        this.isLoggedIn = user.loggedIn;
      }
      return this;
    });
  }

  logout() {
    return this.ajax('GET', '/api/logout').then(() => {
      this.username = 'anonymous';
      this.isLoggedIn = false;
    });
  }

  checkAuthStatus() {
    this.ajax('GET', '/api/authstatus').then((response) => {
      if (response.auth === true) {
        this.isLoggedIn = true;
      } else {
        this.username = 'anonymous';
        this.isLoggedIn = false;
      }
    });
  }
}
