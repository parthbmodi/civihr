<?php

use CRM_HRLeaveAndAbsences_BAO_LeaveRequestDate as LeaveRequestDate;
use CRM_HRLeaveAndAbsences_BAO_LeaveRequest as LeaveRequest;

class CRM_HRLeaveAndAbsences_BAO_LeaveBalanceChange extends CRM_HRLeaveAndAbsences_DAO_LeaveBalanceChange {

  /**
   * Create a new LeaveBalanceChange based on array-data
   *
   * @param array $params key-value pairs
   *
   * @return CRM_HRLeaveAndAbsences_DAO_LeaveBalanceChange|NULL
   */
  public static function create($params) {
    $entityName = 'LeaveBalanceChange';
    $hook = empty($params['id']) ? 'create' : 'edit';

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);
    $instance = new self();
    $instance->copyValues($params);
    $instance->save();
    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  }

  /**
   * Returns the sum of all balance changes for the entitlement with the given ID.
   *
   * This method can also sum only balance changes caused by leave requests with
   * specific statuses. For this, one can pass an array of statuses as the
   * $leaveRequestStatus parameter.
   *
   * Note the balance changes without a respective source will always be included
   * in the sum.
   *
   * @param int $entitlementID
   *    The ID of the entitlement to get the balance
   * @param array $leaveRequestStatus
   *    An array of values from Leave Request Status option list
   *
   * @return float
   */
  public static function getBalanceForEntitlement($entitlementID, $leaveRequestStatus = []) {
    $entitlementID = (int)$entitlementID;
    $balanceChangeTable = self::getTableName();
    $leaveRequestDateTable = LeaveRequestDate::getTableName();
    $leaveRequestTable = LeaveRequest::getTableName();

    $query = "
      SELECT SUM(leave_balance_change.amount) balance
      FROM {$balanceChangeTable} leave_balance_change
      LEFT JOIN {$leaveRequestDateTable} leave_request_date ON leave_balance_change.source_id = leave_request_date.id
      LEFT JOIN {$leaveRequestTable} leave_request ON leave_request_date.leave_request_id = leave_request.id
      WHERE leave_balance_change.entitlement_id = {$entitlementID}
    ";

    if(is_array($leaveRequestStatus) && !empty($leaveRequestStatus)) {
      array_walk($leaveRequestStatus, 'intval');
      $query .= ' AND (leave_balance_change.source_id IS NULL OR leave_request.status_id IN('. implode(', ', $leaveRequestStatus) .'))';
    }

    $result = CRM_Core_DAO::executeQuery($query);
    $result->fetch();

    return (float)$result->balance;
  }

  /**
   * Returns the LeaveBalanceChange instances that are part of the
   * LeavePeriodEntitlement with the given ID.
   *
   * The Breakdown is made of the balance changes representing the parts that,
   * together, make the period entitlement. They are: The Leave, the Brought
   * Forward and the Public Holidays. These are all positive balance changes,
   * without a source_id, since they're are created during the entitlement
   * calculation.
   *
   * @param int $entitlementID
   *   The ID of the LeavePeriodEntitlement to get the Breakdown to
   *
   * @return CRM_HRLeaveAndAbsences_BAO_LeaveBalanceChange[]
   */
  public static function getBreakdownBalanceChangesForEntitlement($entitlementID) {
    $entitlementID = (int)$entitlementID;
    $balanceChangeTable = self::getTableName();

    $query = "
      SELECT *
      FROM {$balanceChangeTable}
      WHERE entitlement_id = {$entitlementID} AND amount >= 0 AND source_id IS NULL
      ORDER BY id
    ";

    $changes = [];

    $result = CRM_Core_DAO::executeQuery($query, [], true, self::class);
    while($result->fetch()) {
      $changes[] = clone $result;
    }

    return $changes;
  }

  /**
   * Returns the balance for the Balance Changes that are part of the
   * LeavePeriodEntitlement with the given ID.
   *
   * This basically gets the output of getBreakdownBalanceChangesForEntitlement()
   * and sums up the amount of the returned LeaveBalanceChange instances.
   *
   * @see CRM_HRLeaveAndAbsences_BAO_LeaveBalanceChange::getBreakdownBalanceChangesForEntitlement()
   *
   * @param int $entitlementID
   *    The ID of the LeavePeriodEntitlement to get the Breakdown Balance to
   *
   * @return float
   */
  public static function getBreakdownBalanceForEntitlement($entitlementID) {
    $balanceChanges = self::getBreakdownBalanceChangesForEntitlement($entitlementID);

    $balance = 0.0;
    foreach($balanceChanges as $balanceChange) {
      $balance += (float)$balanceChange->amount;
    }

    return $balance;
  }
}
