/* global Nightmare, describe, it, before, after */

module.exports.test = (uiTestCtx) => {
  describe('Module test: ui-wayfinder:', () => {
    const { config, helpers: { login, logout } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > navigate to app > verify message > logout', () => {
      before((done) => {
        login(nightmare, config, done);
      });
      after((done) => {
        logout(nightmare, config, done);
      });
      it('should open app and see stripes-new-app-greeting', (done) => {
        nightmare
          .wait('#clickable-wayfinder-module')
          .click('#clickable-wayfinder-module')
          .wait('#wayfinder-module-display')
          .wait('[data-test-application-greeting]')
          .then(() => { done(); })
          .catch(done);
      });
    });

    describe('Login > navigate to app settings > verify message > logout', () => {
      before((done) => {
        login(nightmare, config, done);
      });
      after((done) => {
        logout(nightmare, config, done);
      });
      it('should open app settings and see stripes-new-app-settings-message', (done) => {
        nightmare
          .wait(config.select.settings)
          .click(config.select.settings)
          .wait('a[href="/settings/wayfinder"]')
          .click('a[href="/settings/wayfinder"]')
          .wait('a[href="/settings/wayfinder/general"]')
          .click('a[href="/settings/wayfinder/general"]')
          .wait('[data-test-application-settings-general-message]')
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
