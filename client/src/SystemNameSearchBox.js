import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import { BASE_API_LOCATION } from './App';

export function SystemNameSearchBox(props) {
  const [options, setOptions] = useState([]);
  // const [selectedValue, setSelectedValue] = useState([]);  

  const handleInput = useDebouncedCallback(
    // function
    (value) => {
      getSystemNamesFromBackend(value);
    },
    // delay in ms
    300
  );

  function getSystemNamesFromBackend(searchTerm) {
    if (searchTerm != '0') // For some reason we get a zero after selecting from handleInput...
      fetch(BASE_API_LOCATION + 'SystemNameAutocomplete/' + searchTerm)
        .then(res => res.json())
        .then(data => setOptions(data));
  }

  function onChangeHandler(event, value, reason) {
    // console.log(reason);
    if (reason === 'selectOption') {
      props.selectedValueHandler(value);
    }

    if (reason === 'clear') {
      props.clearSelectionHandler();
    }

  }

  return (
    <Autocomplete
      disablePortal
      // autoComplete={true}
      autoSelect={true}
      id="system-search-box"
      options={options}
      filterOptions={(x) => x}
      sx={{
        p: 1, width: 300, alignContent: 'center',
        textAlign: 'left'
      }}
      // onKeyUp={(e) => handleInput(e.target.value)} 
      onInputChange={(e) => handleInput(e.target.value)}
      onChange={(e, v, r) => onChangeHandler(e, v, r)}
      renderInput={(params) => <TextField
        {...params}
        label="Enter starting system name..."
      />} />
  )
}
