define([
  'common/lodash',
  'leave-absences/shared/modules/models-instances',
  'common/models/instances/instance',
], function (_, instances) {
  'use strict';

  instances.factory('CalendarInstance', [
    '$log', 'ModelInstance',
    function ($log, ModelInstance) {

      /**
       * This method checks whether a date matches the send type.
       *
       * @param {Object} date
       * @param {string} Type of day
       *
       * @return {Boolean}
       * @throws error if date is not found in calendarData
       */
      function checkDate(date, dayType) {
        var searchedDate = this.days[date.getTime()];

        if (!searchedDate) {
          throw new Error('Date not found');
        }

        return searchedDate.type.name === dayType;
      }

      return ModelInstance.extend({

        /**
         * Creates a new instance, optionally with its data normalized.
         * Also, it will allow children to add/remove/update current attributes of
         * the instance using transformAttributes method
         *
         * @param {object} data - The instance data
         * @return {object}
         */
        init: function (data) {
          var iterator,
            length = data.length,
            datesObj = {};

          // convert array to an object with the timestamp being the key
          for (iterator = 0; iterator < length; iterator++) {
            datesObj[new Date(data[iterator].date).getTime()] = data[iterator];
          }

          return _.assign(Object.create(this), {
            days: datesObj
          });
        },

        /**
         * Returns the default custom data (as in, not given by the API)
         * with its default values
         *
         * @return {object}
         */
        defaultCustomData: function () {
          return {
            days: []
          };
        },

        /**
         * This method checks whether a date is working day.
         *
         * @param {Object} date
         * @return {Boolean}
         */
        isWorkingDay: function (date) {
          return checkDate.call(this, date, 'working_day');
        },

        /**
         * This method checks whether a date is non working day.
         *
         * @param {Object} date
         * @return {Boolean}
         */
        isNonWorkingDay: function (date) {
          return checkDate.call(this, date, 'non_working_day');
        },

        /**
         * This method checks whether a date is weekend.
         *
         * @param {Object} date
         * @return {Boolean}
         */
        isWeekend: function (date) {
          return checkDate.call(this, date, 'weekend');
        }
      });
    }]);
});
