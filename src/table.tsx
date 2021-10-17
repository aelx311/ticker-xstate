import { DataGrid } from '@mui/x-data-grid';
import * as React from 'react';

export function Table(props) {
  const { data: dataset } = props;
  console.log(dataset);
  const rows = dataset.data
    .reduce((accumulator, data) => {
      const [date, shortVolume, totalVolume] = data;
       accumulator.push([
        date,
        shortVolume,
        totalVolume,
        +((shortVolume / totalVolume) * 100).toFixed(2),
      ]);
      return accumulator;
    }, [])
    .map((data, index) => {
      const cellData = data.reduce((accumulator, cell, cellIndex) => {
        accumulator[cellIndex] = cell;
        return accumulator;
      }, {});
      return {
        id: index,
        ...cellData,
      };
    });
  const columns = dataset.column_names.map((column, index) => {
    return {
      field: `${index}`,
      headerName: column,
      flex: 1,
    };
  });
  columns.push({ field: 3, headerName: 'Short %', flex: 1 });

  return (
    <div style={{ height: 450, width: '100%', marginTop: '10px' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
      />
    </div>
  );
}
