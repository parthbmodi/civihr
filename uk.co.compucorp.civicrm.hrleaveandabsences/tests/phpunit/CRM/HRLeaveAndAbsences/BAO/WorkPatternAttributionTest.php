<?php

use CRM_HRLeaveAndAbsences_BAO_WorkPatternAttribution as WorkPatternAttribution;
use CRM_HRLeaveAndAbsences_Test_Fabricator_WorkPattern as WorkPatternFabricator;

/**
 * Class CRM_HRLeaveAndAbsences_BAO_WorkPatternAttributionTest
 *
 * @group headless
 */
class CRM_HRLeaveAndAbsences_BAO_WorkPatternAttributionTest extends BaseHeadlessTest {

  public function testThereCannotBeTwoAttributionsForTheSameEmployeeWithTheSameEffectiveDate() {
    $workPattern1 = WorkPatternFabricator::fabricate();
    $workPattern2 = WorkPatternFabricator::fabricate();

    $effectiveDate = CRM_Utils_Date::processDate('2016-01-01');

    WorkPatternAttribution::create([
      'contact_id' => 2,
      'pattern_id' => $workPattern1->id,
      'effective_date' => $effectiveDate,
    ]);

    try {
      WorkPatternAttribution::create([
        'contact_id' => 2,
        'pattern_id' => $workPattern2->id,
        'effective_date' => $effectiveDate,
      ]);
    } catch(PEAR_Exception $e) {
      $this->assertEquals('DB Error: already exists', $e->getMessage());

      return;
    }

    $this->fail('Expected an DB error, but the attribution was created successfully');
  }

}
