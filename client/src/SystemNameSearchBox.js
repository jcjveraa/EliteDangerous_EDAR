import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export function SystemNameSearchBox(props) {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  function handleInput(event) {
    const currentValue = event.target.value;
    setSearchTerm(currentValue);
  }

  useEffect(() => {
    fetch('http://localhost:3001/api/SystemNameAutocomplete/' + searchTerm)
      .then(res => res.json())
      .then(data => setOptions(data));
  }, [searchTerm]);

  return (
    <Autocomplete
      disablePortal
      id="system-search-box"
      options={options}
      filterOptions={(x) => x}
      sx={{
        p: 1, width: 300, alignContent: 'center',
        textAlign: 'left'
      }}
      renderInput={(params) => <TextField
        {...params}
        label="Enter starting system name..."
        onKeyUp={handleInput} />} />
  )
}
