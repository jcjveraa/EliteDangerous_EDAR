import * as React from 'react';
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Typography } from '@mui/material';
import { SystemNameSearchBox } from './SystemNameSearchBox';
import DenseTable from './SearchResults';

export const BASE_API_LOCATION = 'http://localhost:3001/api/';

export default function App() {
  const [selectedValue, setSelectedValue] = useState(undefined);
  const [tradeRouteData, setTradeRouteData] = useState([]);

  useEffect(() => {
    if (selectedValue) {
      console.log(selectedValue);
      fetch(BASE_API_LOCATION + 'findTradeBySystemName/' + selectedValue)
        .then(res => res.json())
        .then(data => setTradeRouteData(data));
    }
  }, [selectedValue]);

  function clearSelectionHandler() {
    console.log('Selection cleared!');
    setSelectedValue(undefined);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Title />
      <SystemNameSearchBox
        selectedValueHandler={setSelectedValue}
        clearSelectionHandler={clearSelectionHandler}
      />
      <DenseTable
      traderoute = {tradeRouteData}
      />
    </React.Fragment>
  );
}

function Title() {
  return (
    <Box sx={{
      // p: 0.5,
      marginBottom: 2,
      alignContent: 'center',
      textAlign: 'center',
    }}>
      <Typography variant="headline" component="h3">
        Elite Dangerous Trade Computer
      </Typography>
    </Box>
  )
}


