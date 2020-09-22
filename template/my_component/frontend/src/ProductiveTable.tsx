import { range } from "lodash"
import React, { Fragment, ReactNode, useEffect } from "react"
import { Button, Table as UITable } from "reactstrap"
import {
  ArrowTable,
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib"

interface TableProps {
  element: ArrowTable
  skipFirstCol: boolean
}

interface TableRowProps {
  skipFirstCol: boolean
  rowIndex: number
  table: ArrowTable
}

class Table extends React.PureComponent<TableProps> {
  public returnDataframe = (): void => {
    // NOTE: Returning Styler data is not supported,
    // so it won't be included in the returned dataframe.
    Streamlit.setComponentValue(this.props.element)
  }

  public render = (): ReactNode => {
    const table = this.props.element
    const skipFirstCol = this.props.skipFirstCol
    const hasHeader = table.headerRows > 0
    const hasData = table.dataRows > 0
    const id = table.uuid ? "T_" + table.uuid : undefined
    const classNames = hasData ? undefined : "empty-table"
    const caption = table.caption ? <caption>{table.caption}</caption> : null

    return (
      <>
        <div className="streamlit-table stTable">
          <style>{table.styles}</style>
          <UITable id={id} className={classNames} bordered>
            {caption}
            {hasHeader && (
              <thead>
                <TableRows skipFirstCol={skipFirstCol} isHeader={true} table={table} />
              </thead>
            )}
            <tbody>
              {hasData ? (
                <TableRows skipFirstCol={skipFirstCol} isHeader={false} table={table} />
              ) : (
                <tr>
                  <td colSpan={table.columns || 1}>empty</td>
                </tr>
              )}
            </tbody>
          </UITable>
        </div>
      </>
    )
  }
}

/**
 * Purely functional component returning a list of rows.
 *
 * isHeader     - Whether to display the header.
 * table        - The table to display.
 */

interface TableRowsProps {
  isHeader: boolean
  skipFirstCol: boolean
  table: ArrowTable
}

const TableRows: React.FC<TableRowsProps> = (props) => {
  const { isHeader, skipFirstCol, table } = props
  const { headerRows, rows } = table
  const startRow = isHeader ? 0 : headerRows
  const endRow = isHeader ? headerRows : rows

  const tableRows = range(startRow, endRow).map((rowIndex) => (
    <tr key={rowIndex}>
      <TableRow skipFirstCol={skipFirstCol} rowIndex={rowIndex} table={table} />
    </tr>
  ))

  return <Fragment>{tableRows}</Fragment>
}

/**
 * Purely functional component returning a list entries for a row.
 *
 * rowIndex - The row index.
 * table    - The table to display.
 */

interface TableRowProps {
  rowIndex: number
  skipFirstCol: boolean
  table: ArrowTable
}

const TableRow: React.FC<TableRowProps> = (props) => {
  const { rowIndex, skipFirstCol, table } = props
  const { columns } = table

  const cells = range(skipFirstCol ? 1 : 0, columns).map((columnIndex) => {
    const { classNames, content, id, type } = table.getCell(
      rowIndex,
      columnIndex
    )

    // Format the content if needed
    const formattedContent = content.toString()

    switch (type) {
      case "blank": {
        return <th key={columnIndex} className={classNames} />
      }
      case "index": {
        return (
          <th key={columnIndex} scope="row" className={classNames}>
            {formattedContent}
          </th>
        )
      }
      case "columns": {
        return (
          <th key={columnIndex} scope="col" id={id} className={classNames}>
            {formattedContent}
          </th>
        )
      }
      case "data": {
        return (
          <td key={columnIndex} id={id} className={classNames}>
            {formattedContent}
          </td>
        )
      }
      default: {
        throw new Error(`Cannot parse type "${type}".`)
      }
    }
  })

  return <Fragment>{cells}</Fragment>
}

/**
 * Dataframe example using Apache Arrow.
 */
const ProductiveTable: React.FC<ComponentProps> = (props) => {
  useEffect(() => {
    Streamlit.setFrameHeight()
  })

  return <Table skipFirstCol={props.args.skip_first_col} element={props.args.data} />
}

export default withStreamlitConnection(ProductiveTable)
