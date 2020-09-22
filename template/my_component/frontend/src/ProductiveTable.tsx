import React, { useState, useEffect, ReactText } from "react"
import { range, zipObject } from "lodash"
import { SelectionState, IntegratedSelection, SortingState, IntegratedSorting} from "@devexpress/dx-react-grid"
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableSelection
} from "@devexpress/dx-react-grid-material-ui"
import {
  ArrowTable,
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib"

interface TableRowsProps {
  isHeader: boolean
  skipFirstCol: boolean
  table: ArrowTable
}

/**
 * Function returning a list of rows.
 *
 * isHeader     - Whether to display the header.
 * table        - The table to display.
 */
const tableRows = (props: TableRowsProps): string[][] => {
  const { isHeader, skipFirstCol, table } = props
  const { headerRows, rows } = table
  const startRow = isHeader ? 0 : headerRows
  const endRow = isHeader ? headerRows : rows

  const tableRows = range(startRow, endRow).map(rowIndex =>
    tableRow({ skipFirstCol, rowIndex, table })
  )

  return tableRows
}

interface TableRowProps {
  skipFirstCol: boolean
  rowIndex: number
  table: ArrowTable
}

/**
 * Function returning a list entries for a row.
 *
 * rowIndex - The row index.
 * table    - The table to display.
 */
const tableRow = (props: TableRowProps): string[] => {
  const { skipFirstCol, rowIndex, table } = props
  const { columns } = table

  const cells = range(skipFirstCol ? 1 : 0, columns).map(columnIndex => {
    const { content } = table.getCell(rowIndex, columnIndex)
    return content.toString()
  })

  return cells
}

const formatRows = (rows: string[][], columns: string[][]) =>
  rows.map(row => zipObject(columns[0], row))

const formatColumns = (columns: string[][]) =>
  columns[0].map(column => ({ name: column }))

const ProductiveTable: React.FC<ComponentProps> = props => {
  useEffect(() => {
    Streamlit.setFrameHeight(undefined)
  })

  /*
  const handleSelectionChange = (value: ReactText[]): void => {
    setSelection(value)
    Streamlit.setComponentValue(value)
  }

  const [selection, setSelection] = useState<ReactText[]>([])
  */
  const columns = tableRows({ isHeader: true, skipFirstCol: props.args.skip_first_col, table: props.args.data })
  const rows = tableRows({ isHeader: false, skipFirstCol: props.args.skip_first_col, table: props.args.data })

  return (
    <Grid rows={formatRows(rows, columns)} columns={formatColumns(columns)}>
      <SortingState/>
        <IntegratedSorting />
      <VirtualTable />
      <TableHeaderRow showSortingControls />
    </Grid>
  )
}

export default withStreamlitConnection(ProductiveTable)
