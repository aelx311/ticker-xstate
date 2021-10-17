import './styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { Table } from './table';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

interface TickerContext {
  ticker: string;
  data: Array<any>;
  error: any;
}

function invokeFetchTicker(context) {
  const { ticker } = context;

  return fetch(
    `https://data.nasdaq.com/api/v3/datasets/BATS/EDGA_${ticker}?start_date=2021-01-01&end_date=2021-12-31&api_key=2dzi5Bc538dC8dYGhjts`,
  )
    .then((response) => {
      if (!response.ok) {
        return Promise.reject('error getting data');
      }

      return response.json();
    })
    .then((json) => json.dataset);
}

const tickerMachine = createMachine<TickerContext>({
  id: 'ticker',
  initial: 'idle',
  context: {
    ticker: '',
    data: [],
    error: null,
  },
  states: {
    idle: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0,
        },
      },
    },
    loading: {
      invoke: {
        id: 'loading-ticker',
        src: invokeFetchTicker,
        onDone: {
          target: 'loaded',
          actions: assign({
            data: (context, event) => event.data,
          }),
        },
        onError: {
          target: 'failed',
          actions: assign({
            error: (context, event) => event.data,
          }),
        },
      },
    },
    loaded: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0,
        },
      },
    },
    failed: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0,
        },
        RESET: {
          target: 'idle',
        },
      },
    },
  },
  on: {
    TICKER_INPUT: {
      actions: assign({
        ticker: (context, event) => event.ticker,
      }),
    },
  },
});

function App() {
  const [current, send] = useMachine(tickerMachine);
  const { ticker, data, error } = current.context;

  return (
    <div className="App">
      <Typography variant="h2" gutterBottom component="div">
        Ticker Machine
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Input
            type="text"
            onChange={(event) =>
              send('TICKER_INPUT', { ticker: event.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Button
            variant="contained"
            disabled={ticker.length === 0}
            onClick={() => send('FETCH')}>
            Click me to fetch
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
          onClose={() => send('RESET')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {current.matches('loaded') && <Table data={data} />}
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
