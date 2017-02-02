define([
    'job-contract/controllers/controllers'
], function (controllers) {
    'use strict';

    controllers.controller('FormPayCtrl',['$scope','$filter','settings', '$log',
        function ($scope, $filter, settings, $log) {
            $log.debug('Controller: FormPayCtrl');

            var entityPay = $scope.entity.pay || {},
                defaults = {
                    pay_amount: 0,
                    pay_currency: settings.CRM.defaultCurrency,
                    pay_cycle: '2',
                    pay_unit: 'Year'
                },
                utilsPayScaleGrade = $scope.utils.payScaleGrade,
                workPerYear = {
                    Year: 1,
                    Month: 12,
                    Week: 52,
                    Fortnight: 26,
                    Day: 260,
                    Hour: 2080
                };

            entityPay.is_paid = entityPay.is_paid || 0;
            entityPay.pay_is_auto_est = '0';
            entityPay.annual_benefits = entityPay.annual_benefits || [];
            entityPay.annual_deductions = entityPay.annual_deductions || [];

            $scope.collapseBenDed = !entityPay.annual_benefits.length && !entityPay.annual_deductions.length;
            $scope.benefits_per_cycle = (0).toFixed(2);
            $scope.benefits_per_cycle_net = 0;
            $scope.deductions_per_cycle = (0).toFixed(2);

            function getCycles() {
                var cycles = 1;

                switch (+entityPay.pay_cycle) {
                    case 1:
                        cycles = workPerYear.Week;
                        break;
                    case 2:
                        cycles = workPerYear.Month;
                        break;
                }

                return cycles;
            }

            $scope.add = function(array){
                array.push({
                    "name": "",
                    "type": "",
                    "amount_pct": "",
                    "amount_abs": ""
                });
            };

            $scope.applyPayScaleGradeData = function(){
                if (entityPay.pay_scale) {
                    var payScaleGrade = $filter('getObjById')(utilsPayScaleGrade, entityPay.pay_scale);
                    entityPay.pay_amount = payScaleGrade.amount || defaults.pay_amount;
                    entityPay.pay_currency = payScaleGrade.currency || defaults.pay_currency;
                    entityPay.pay_unit = payScaleGrade.periodicity || defaults.pay_unit;
                }
            };

            $scope.calcAnnualPayEst = function(){
                var entityHour = $scope.entity.hour;

                if (+entityPay.is_paid) {
                  entityPay.pay_annualized_est = (entityPay.pay_amount * workPerYear[entityPay.pay_unit] * entityHour.hours_fte || 0).toFixed(2);
                }
            };

            $scope.calcBenefitsPerCycle = function(){
                if (+entityPay.is_paid) {
                    var i = 0, len = entityPay.annual_benefits.length, annualBenefits = 0;
                    for (i; i < len; i++) {

                        if (+entityPay.annual_benefits[i].type == 2) {
                            entityPay.annual_benefits[i].amount_abs = (entityPay.annual_benefits[i].amount_pct/100 * entityPay.pay_annualized_est).toFixed(2);
                        }

                        annualBenefits += +entityPay.annual_benefits[i].amount_abs;
                    }
                    $scope.benefits_per_cycle = (annualBenefits / getCycles()).toFixed(2);
                }
            };

            $scope.calcBenefitsPerCycleNet = function(){
                if (+entityPay.is_paid) {
                    $scope.benefits_per_cycle_net = $scope.benefits_per_cycle - $scope.deductions_per_cycle;
                }
            };

            $scope.calcDeductionsPerCycle = function(){
                if (+entityPay.is_paid) {
                    var i = 0, len = entityPay.annual_deductions.length, annualDeductions = 0;
                    for (i; i < len; i++) {

                        if (+entityPay.annual_deductions[i].type == 2) {
                            entityPay.annual_deductions[i].amount_abs = (entityPay.annual_deductions[i].amount_pct/100 * entityPay.pay_annualized_est).toFixed(2);
                        }

                        annualDeductions += +entityPay.annual_deductions[i].amount_abs;
                    }
                    $scope.deductions_per_cycle = (annualDeductions / getCycles()).toFixed(2);
                }
            };

            $scope.calcPayPerCycleGross = function(){
                if (+entityPay.is_paid) {

                    entityPay.pay_per_cycle_gross = (entityPay.pay_annualized_est / getCycles()).toFixed(2);
                }
            }

            $scope.calcPayPerCycleNet = function(){
                if (+entityPay.is_paid) {
                    entityPay.pay_per_cycle_net = (+entityPay.pay_per_cycle_gross + +$scope.benefits_per_cycle_net).toFixed(2);
                }
            }

            $scope.resetData = function(){
                entityPay.pay_scale = '';
                entityPay.pay_amount = '';
                entityPay.pay_unit = '';
                entityPay.pay_currency = '';
                entityPay.pay_annualized_est = '';
                entityPay.pay_is_auto_est = '';
                entityPay.annual_benefits = [];
                entityPay.annual_deductions = [];
                entityPay.pay_cycle = '';
                entityPay.pay_per_cycle_gross = '';
                entityPay.pay_per_cycle_net = '';
                $scope.benefits_per_cycle = '';
                $scope.deductions_per_cycle = '';
            };

            $scope.setDefaults = function(){
                entityPay.pay_cycle = defaults.pay_cycle;
                entityPay.pay_currency = defaults.pay_currency;
                entityPay.pay_is_auto_est = '0';
                entityPay.pay_amount = (0).toFixed(2);
            };

            $scope.remove = function(array, index){
                array.splice(index, 1);
            };

            $scope.$watch('entity.pay.pay_amount', $scope.calcAnnualPayEst);
            $scope.$watch('entity.pay.pay_unit', $scope.calcAnnualPayEst);
            $scope.$watch('entity.hour.hours_fte', $scope.calcAnnualPayEst);
            $scope.$watch('entity.pay.pay_annualized_est', function(){
                $scope.calcPayPerCycleGross();
                $scope.calcBenefitsPerCycle();
                $scope.calcDeductionsPerCycle();
            });
            $scope.$watch('entity.pay.annual_benefits', $scope.calcBenefitsPerCycle,true);
            $scope.$watch('entity.pay.annual_deductions', $scope.calcDeductionsPerCycle,true);
            $scope.$watch('benefits_per_cycle',$scope.calcBenefitsPerCycleNet);
            $scope.$watch('deductions_per_cycle',$scope.calcBenefitsPerCycleNet);
            $scope.$watch('benefits_per_cycle_net',$scope.calcPayPerCycleNet);
            $scope.$watch('entity.pay.pay_per_cycle_gross',$scope.calcPayPerCycleNet);

        }]);
});
