import { range } from "lodash"
import React, { Fragment, ReactNode, useEffect } from "react"
import { Button, Table as UITable } from "reactstrap"
import {
  ArrowTable,
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib"

const missingValueString = "N/A"

interface TableProps {
  element: ArrowTable
  showIndex: boolean
}

interface TableRowProps {
  showIndex: boolean
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
    const showIndex = this.props.showIndex
    const hasHeader = table.headerRows > 0
    const hasData = table.dataRows > 0
    const id = table.uuid ? "T_" + table.uuid : undefined
    const classNames = hasData ? undefined : "empty-table"
    const caption = table.caption ? <caption>{table.caption}</caption> : null

    return (
      <>
        <div className="streamlit-table stTable" style={{overflow: 'auto'}}>
          <style>{table.styles}</style>
          <UITable id={id} className={classNames} bordered>
            {caption}
            {hasHeader && (
              <thead>
                <TableRows showIndex={showIndex} isHeader={true} table={table} />
              </thead>
            )}
            <tbody>
              {hasData ? (
                <TableRows showIndex={showIndex} isHeader={false} table={table} />
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
  showIndex: boolean
  table: ArrowTable
}

const TableRows: React.FC<TableRowsProps> = (props) => {
  const { isHeader, showIndex, table } = props
  const { headerRows, rows } = table
  const startRow = isHeader ? 0 : headerRows
  const endRow = isHeader ? headerRows : rows

  const tableRows = range(startRow, endRow).map((rowIndex) => (
    <tr key={rowIndex}>
      <TableRow showIndex={showIndex} rowIndex={rowIndex} table={table} />
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
  showIndex: boolean
  table: ArrowTable
}

const TableRow: React.FC<TableRowProps> = (props) => {
  const { rowIndex, showIndex, table } = props
  const { columns } = table

  const cells = range(0, columns).map((columnIndex) => {
    const { classNames, content, id, type } = table.getCell(
      rowIndex,
      columnIndex
    )

    // Format the content if needed
    const formattedContent = (content ? content.toString() : missingValueString)

    switch (type) {
      // TODO: here we assume that a blank corresponds exactly to an index column.
      // if this is not the case, we may mess tables up this way
      case "blank": {
        if (showIndex) {
          return <th key={columnIndex} className={classNames} />
        } else {
          return
        }
      }
      case "index": {
        if (showIndex) {
          return (
            <th key={columnIndex} scope="row" className={classNames}>
              {formattedContent}
            </th>
          )
        } else {
          return
        }
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

  return <Table showIndex={props.args.show_index} element={props.args.data} />
}

export default withStreamlitConnection(ProductiveTable)
