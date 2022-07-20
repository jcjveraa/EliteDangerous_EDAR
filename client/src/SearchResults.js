import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

export default function DenseTable(props) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Buy&nbsp;from</TableCell>
            <TableCell align="left">Sell&nbsp;to</TableCell>
            <TableCell align="left">Commodity</TableCell>
            <TableCell align="right">Profit per unit</TableCell>
            <TableCell align="right">Total profit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.traderoute.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
              {row.buy_from_system_name} - {row.buy_from_station_name} @{row.buy_for}&nbsp;Cr.
              </TableCell>
              <TableCell align="left">{row.sell_to_system_name} - {row.sell_to_station_name} @{row.sell_for}&nbsp;Cr.</TableCell>
              <TableCell align="left">{row.commodity_name}</TableCell>
              <TableCell align="right">{row.profit_per_unit}</TableCell>
              <TableCell align="right">{row.total_profit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
