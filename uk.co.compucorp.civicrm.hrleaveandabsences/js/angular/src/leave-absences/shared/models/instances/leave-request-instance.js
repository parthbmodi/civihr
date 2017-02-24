define([
  'leave-absences/shared/modules/models-instances',
  'common/models/option-group',
  'common/models/instances/instance'
], function (instances) {
  'use strict';

  instances.factory('LeaveRequestInstance', [
    'ModelInstance',
    'LeaveRequestAPI',
    'OptionGroup',
    '$q',
    function (ModelInstance, LeaveRequestAPI, OptionGroup, $q) {

      /**
       * Get ID of an option value
       *
       * @param {string} name - name of the option value
       * @return {Promise} Resolved with {Object} - Specific leave request
       */
      function getOptionIDByName(name) {
        return OptionGroup.valuesOf('hrleaveandabsences_leave_request_status')
          .then(function (data) {
            return data.find(function (statusObj) {
              return statusObj.name === name;
            })
          })
      }

      /**
       * Update status ID
       *
       * @param {string} status - name of the option value
       * @return {Promise} Resolved with {Object} - Error Data in case of error
       */
      function changeLeaveStatus(status) {
        return getOptionIDByName(status)
          .then(function (statusId) {
            this.status_id = statusId.value;
            return this.update();
          }.bind(this));
      }

      /**
       * Checks if a LeaveRequest is of a specific type
       *
       * @param {string} statusName - name of the option value
       * @return {Promise} Resolved with {Boolean}
       */
      function checkLeaveStatus(statusName) {
        return getOptionIDByName(statusName)
          .then(function (statusObj) {
            return this.status_id === statusObj.value;
          }.bind(this));
      }

      /**
       * Save comments which do not have an ID
       *
       * @return {Promise}
       */
      function saveCommentsWithoutID() {
        var promises = [],
          self = this;

        self.comments.map(function (comment, index) {
          if (!comment.comment_id) {
            //IIFE is created to keep actual value of 'index' when promise is resolved
            (function (index) {
              promises.push(LeaveRequestAPI.saveComment(self.id, comment)
                .then(function (comment) {
                  self.comments[index] = comment;
                }));
            })(index);
          }
        });

        return $q.all(promises);
      }

      return ModelInstance.extend({

        /**
         * Returns the default custom data (as in, not given by the API)
         * with its default values
         *
         * @return {object}
         */
        defaultCustomData: function () {
          return {
            comments: []
          };
        },
        /**
         * Cancel a leave request
         */
        cancel: function () {
          return changeLeaveStatus.call(this, 'cancelled');
        },

        /**
         * Approve a leave request
         */
        approve: function () {
          return changeLeaveStatus.call(this, 'approved');
        },

        /**
         * Reject a leave request
         */
        reject: function () {
          return changeLeaveStatus.call(this, 'rejected');
        },

        /**
         * Sends a leave request back as more information is required
         */
        sendBack: function () {
          return changeLeaveStatus.call(this, 'more_information_requested');
        },

        /**
         * Update a leave request
         *
         * @return {Promise} Resolved with {Object} Updated Leave request
         */
        update: function () {
          return LeaveRequestAPI.update(this.toAPI())
            .then(function () {
              return saveCommentsWithoutID.call(this);
            }.bind(this));
        },

        /**
         * Create a new leave request
         *
         * @return {Promise} Resolved with {Object} Created Leave request with
         *  newly created id for this instance
         */
        create: function () {
          return LeaveRequestAPI.create(this.toAPI())
            .then(function (result) {
              this.id = result.id;
              return saveCommentsWithoutID.call(this);
            }.bind(this));
        },

        /**
         * Validate leave request instance attributes.
         *
         * @return {Promise} empty array if no error found otherwise an object
         *  with is_error set and array of errors
         */
        isValid: function () {
          return LeaveRequestAPI.isValid(this.toAPI());
        },

        /**
         * Checks if a LeaveRequest is Approved.
         *
         * @return {Promise} resolved with {Boolean}
         */
        isApproved: function () {
          return checkLeaveStatus.call(this, 'approved');
        },

        /**
         * Checks if a LeaveRequest is AwaitingApproval.
         *
         * @return {Promise} resolved with {Boolean}
         */
        isAwaitingApproval: function () {
          return checkLeaveStatus.call(this, 'waiting_approval');
        },

        /**
         * Checks if a LeaveRequest is cancelled.
         *
         * @return {Promise} resolved with {Boolean}
         */
        isCancelled: function () {
          return checkLeaveStatus.call(this, 'cancelled');
        },

        /**
         * Checks if a LeaveRequest is Rejected.
         *
         * @return {Promise} resolved with {Boolean}
         */
        isRejected: function () {
          return checkLeaveStatus.call(this, 'rejected');
        },

        /**
         * Checks if a LeaveRequest is Sent Back.
         *
         * @return {Promise} resolved with {Boolean}
         */
        isSentBack: function () {
          return checkLeaveStatus.call(this, 'more_information_requested');
        },

        loadComments: function () {
          var self = this;

          return LeaveRequestAPI.getComments(this.id)
            .then(function (comments) {
              self.comments = comments;
            });
        },

        /**
         * Check the role of a given contact in relationship to the leave request.
         *
         * @param {Object} contact - contact object
         *
         * @return {Promise} resolves with an {String} - owner/manager/none
         */
        roleOf: function (contact) {
          var deferred = $q.defer();

          if (this.contact_id == contact.id) {
            deferred.resolve('owner');
          } else {
            LeaveRequestAPI.isManagedBy(this.id, contact.id)
              .then(function (response) {
                //TODO Implement check for Admin in MS5
                if (!!response) {
                  deferred.resolve('manager');
                } else {
                  deferred.resolve('none');
                }
              });
          }

          return deferred.promise;
        },

        /**
         * Override of parent method
         *
         * @param {object} result - The accumulator object
         * @param {string} key - The property name
         */
        toAPIFilter: function (result, __, key) {
          if (!_.includes(['balance_change', 'dates', 'comments'], key)) {
            result[key] = this[key];
          }
        }
      });
    }
  ]);
});
