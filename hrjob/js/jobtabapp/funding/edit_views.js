// Copyright CiviCRM LLC 2013. See http://civicrm.org/licensing
CRM.HRApp.module('JobTabApp.Funding', function(Funding, HRApp, Backbone, Marionette, $, _) {
  Funding.EditView = HRApp.Common.Views.StandardForm.extend({
    template: '#hrjob-funding-template',
    templateHelpers: function() {
      return {
        'isNew': this.model.get('id') ? false : true,
        'isNewDuplicate': this.model._isDuplicate ? true : false,
        'RenderUtil': CRM.HRApp.RenderUtil,
        'FieldOptions': CRM.FieldOptions.HRJob,
        'rolesInfo': this.roleDataView()
      };
    },
    initialize: function() {
      HRApp.Common.Views.StandardForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.options.collection, 'sync', this.toggleIsPrimary);
    },
    onRender: function() {
      HRApp.Common.Views.StandardForm.prototype.onRender.apply(this, arguments);
      this.roleDataView();
    },
    modelEvents: {
      'change:funder': 'roleDataView'
    },
    roleDataView: function() {
      var view = this, rolesInfo = {}, $rowspan=1;
      _.forEach(view.options.roleCollection.models, function (model) {
        var id = model.get('id'),
          percentRel = {},
          funderPercExpr = model.get('percent_pay_funder'), fundersPer = 0;
        if (funderPercExpr) {
          percentFunders = funderPercExpr.split(',');
          _.each(percentFunders, function(percentfunderExpr){
            percentAndFunder = percentfunderExpr.split('-');
            percentRel[percentAndFunder[0]] =  percentAndFunder[1];
            $rowspan += 1;
            view.$('a#hrjob-role-funder-'+percentAndFunder[0]).hrContactLink({
              cid: percentAndFunder[0]
            });
          });
        }
        if(!rolesInfo[id]) {
          rolesInfo[id]={
            'position': model.get('title'),
            'funderInfo': percentRel,
            'rowspan': $rowspan,
            'percentPay': model.get('percent_pay_role')
          };
        }
      });
      return rolesInfo;
    }
    /* HR-395 -- remove is tied to funding field
    onBindingCreate: function(bindings) {
      bindings.is_tied_to_funding = {
        selector: 'input[name=is_tied_to_funding]',
        converter: HRApp.Common.convertCheckbox
      };
    }
    */
  });
});
