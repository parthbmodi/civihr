var tab = require('./tab');

module.exports = (function () {
  return tab.extend({
    readySelector: '.hrjobroles-basic-details',
    tabTitle: 'Job Roles',

    /**
     * [attemptDelete description]
     * @return {[type]} [description]
     */
    attemptDelete: function () {
      var casper = this.casper;

      casper.then(function () {
        casper.click('.hrjobroles-list-role-item [ng-click*="removeRole"]');
        this.waitForModal();
      }.bind(this));
    },

    /**
     * [edit description]
     * @return {[type]} [description]
     */
    edit: function () {
      var casper = this.casper;

      casper.then(function () {
        casper.click('.tab-pane.active form > .btn-tab-action');
        casper.wait(100);
      });
    },

    /**
     * [showAddNew description]
     * @return {[type]} [description]
     */
    showAddNew: function () {
      var casper = this.casper;

      casper.then(function () {
        casper.click('.btn-primary[ng-click*="add_new_role"]');
      });
    },

    /**
     * [switchToTab description]
     * @param  {[type]} tabName [description]
     * @return {[type]}         [description]
     */
    switchToTab: function (tabName) {
      var casper = this.casper;

      casper.then(function () {
        casper.clickLabel(tabName);
      });

      return this;
    }
  });
})();
