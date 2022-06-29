import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Typography } from '@mui/material';
import { SystemNameSearchBox } from './SystemNameSearchBox';

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Title />
      <SystemNameSearchBox />
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


