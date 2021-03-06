<?php

class CRM_Hrjobcontract_Export_Converter {

  /**
   * This method is based on CRM_Export_BAO_Export::writeCSVFromTable()
   * but adds check for hrjobcontract entities and runs values converting
   * on them so we get proper Job Contract entity values exported.
   *
   * @param $exportTempTable
   * @param $headerRows
   * @param $sqlColumns
   * @param $exportMode
   * @param null $saveFile
   * @param string $batchItems
   */
  public static function writeCSVFromTable($exportTempTable, $headerRows, $sqlColumns, $exportMode, $saveFile = NULL, $batchItems = '') {
    $converter = CRM_Hrjobcontract_ExportImportValuesConverter::singleton();
    $writeHeader = TRUE;
    $offset = 0;
    $limit = CRM_Export_BAO_Export::EXPORT_ROW_COUNT;
    $query = "SELECT * FROM {$exportTempTable}";
    $total = (int)CRM_Core_DAO::singleValueQuery("SELECT COUNT(*) AS total FROM {$exportTempTable}");

    $getExportFileName = CRM_Export_BAO_Export::getExportFileName('csv', $exportMode);
    if ($exportMode == 'financial') {
      $getExportFileName = 'CiviCRM Contribution Search';
    }

    while ($offset < $total) {
      $limitQuery = $query . " LIMIT {$offset}, {$limit} ";
      $dao = CRM_Core_DAO::executeQuery($limitQuery);

      $componentDetails = array();
      while ($dao->fetch()) {
        $row = array();

        foreach ($sqlColumns as $column => $dontCare) {
          $row[$column] = $dao->$column;
          // Convert Job Contract entity values to their proper export
          // format defined in CRM_Hrjobcontract_ExportImportValuesConverter class.
          if (substr($column, 0, 13) === 'hrjobcontract') {
            list(, $entity, $field) = explode('_', $column, 3);
            $row[$column] = $converter->export($entity, $field, $row[$column]);
          }
        }

        $componentDetails[] = $row;
      }

      $csvRows = CRM_Core_Report_Excel::writeCSVFile($getExportFileName,
        $headerRows,
        $componentDetails,
        NULL,
        $writeHeader,
        $saveFile);

      if ($saveFile && !empty($csvRows)) {
        $batchItems .= $csvRows;
      }

      $writeHeader = FALSE;
      $offset += $limit;
    }
  }
}
