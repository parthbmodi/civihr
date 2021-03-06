<?php

use CRM_HRCore_Test_Fabricator_Contact as ContactFabricator;

/**
 * Class CRM_HRSampleData_Importer_BankDetailsTest
 *
 * @group headless
 */
class CRM_HRSampleData_CSVProcessor_BankDetailsTest extends CRM_HRSampleData_BaseCSVProcessorTest {

  private $testContact;

  public function setUp() {
    $this->rows = [];
    $this->rows[] = $this->importHeadersFixture();

    $this->testContact = ContactFabricator::fabricate();
  }

  public function testProcess() {
    $this->rows[] = [
      $this->testContact['id'],
      'Peter Agodi',
      '15-37-89',
      '111125431',
      'BarclaysBank PLC',
      'Wandsworth',
    ];

    $mapping = [
      ['contact_mapping', $this->testContact['id']],
    ];

    $this->runProcessor('CRM_HRSampleData_Importer_BankDetails', $this->rows, $mapping);

    $bankDetails = $this->apiGet('CustomValue', ['entity_id' => $this->testContact['id']]);

    $this->assertEquals($this->testContact['id'], $bankDetails['entity_id']);
  }

  private function importHeadersFixture() {
    return [
      'entity_id',
      'Account_Holder',
      'Sort_Code',
      'Account_No',
      'Bank_Name',
      'Bank_Address_Line_1',
    ];
  }

}
