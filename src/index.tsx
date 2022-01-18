import './styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useMachine } from '@xstate/react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { Table } from './table';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import tickerMachine from './machine';

function App() {
  const [current, send] = useMachine(tickerMachine);
  const { ticker, data, exchange, error } = current.context;

  return (
    <div className="App">
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={4}>
          <TextField
            label="Ticker"
            variant="outlined"
            onChange={(event) =>
              send('TICKER_INPUT', { ticker: event.target.value })
            }
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            value={exchange}
            label="Exchange"
            variant="outlined"
            onChange={(event) =>
              send('EXCHANGE_SELECT', {
                exchange: event.target.value
              })
            }
          >
            <MenuItem value="BATS">BATS</MenuItem>
            <MenuItem value="BYXX">BYXX</MenuItem>
            <MenuItem value="EDGA">EDGA</MenuItem>
            <MenuItem value="EDGX">EDGX</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            disabled={ticker.length === 0 || exchange.length === 0}
            onClick={() => send('FETCH')}
          >
            Fetch
          </Button>
        </Grid>
      </Grid>
      {current.matches('loading') && (
        <Box>
          <CircularProgress />
        </Box>
      )}
      {current.matches('failed') && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          message={error}
          onClose={() => send('RESET')}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {current.matches('loaded') && <Table data={data} />}
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
