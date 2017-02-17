<?php

use CRM_HRLeaveAndAbsences_BAO_LeaveRequest as LeaveRequest;
use CRM_HRLeaveAndAbsences_Test_Fabricator_LeaveBalanceChange as LeaveBalanceChangeFabricator;

class CRM_HRLeaveAndAbsences_Test_Fabricator_LeaveRequest {

  private static $leaveRequestStatuses;
  private static $dayTypes;

  public static function fabricate($params, $withBalanceChanges = false) {
    $params = self::mergeDefaultParams($params);

    $leaveRequest = LeaveRequest::create($params);
    if($withBalanceChanges) {
      foreach($leaveRequest->getDates() as $date) {
        LeaveBalanceChangeFabricator::fabricateForLeaveRequestDate($date);
      }
    }

    return $leaveRequest;
  }

  /**
   * Creates a new Leave Request without running any validation
   *
   * @param array $params
   * @param boolean $withBalanceChanges
   *
   * @return \CRM_HRLeaveAndAbsences_BAO_LeaveRequest
   */
  public static function fabricateWithoutValidation($params = [], $withBalanceChanges = false) {
    $params = self::mergeDefaultParams($params);
    $leaveRequest =  LeaveRequest::create($params, false);

    if ($withBalanceChanges) {
      foreach ($leaveRequest->getDates() as $date) {
        LeaveBalanceChangeFabricator::fabricateForLeaveRequestDate($date);
      }
    }

    return $leaveRequest;
  }

  private static function mergeDefaultParams($params) {
    $defaultParams = [
      'status_id' => self::getStatusId('Approved'),
      'from_date_type' => self::getDayTypeId('All Day'),
      'request_type' => LeaveRequest::REQUEST_TYPE_LEAVE
    ];

    if(!empty($params['to_date']) && empty($params['to_date_type'])) {
      $defaultParams['to_date_type'] = self::getDayTypeId('All Day');
    }

    return array_merge($defaultParams, $params);
  }

  private static function getStatusId($statusLabel) {
    if(is_null(self::$leaveRequestStatuses)) {
      self::$leaveRequestStatuses = array_flip(LeaveRequest::buildOptions('status_id'));
    }

    return self::$leaveRequestStatuses[$statusLabel];
  }

  private static function getDayTypeId($typeLabel) {
    if(is_null(self::$dayTypes)) {
      self::$dayTypes = array_flip(LeaveRequest::buildOptions('from_date_type'));
    }

    return self::$dayTypes[$typeLabel];
  }
}