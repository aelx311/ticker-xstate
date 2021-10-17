import { createMachine, assign } from 'xstate';

interface TickerContext {
  ticker: string;
  data: Array<any>;
  exchange: string;
  error: any;
}

function invokeFetchTicker(context) {
  const { ticker, exchange } = context;

  if (!ticker) {
    return Promise.reject('ticker is required');
  }

  if (!exchange) {
    return Promise.reject('exchange is required');
  }

  return fetch(
    `https://data.nasdaq.com/api/v3/datasets/BATS/${exchange}_${ticker}?start_date=2021-01-01&end_date=2021-12-31&api_key=2dzi5Bc538dC8dYGhjts`
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
    exchange: 'BATS',
    error: null
  },
  states: {
    idle: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0
        }
      }
    },
    loading: {
      invoke: {
        id: 'loading-ticker',
        src: invokeFetchTicker,
        onDone: {
          target: 'loaded',
          actions: assign({
            data: (context, event) => event.data
          })
        },
        onError: {
          target: 'failed',
          actions: assign({
            error: (context, event) => event.data
          })
        }
      }
    },
    loaded: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0
        }
      }
    },
    failed: {
      on: {
        FETCH: {
          target: 'loading',
          cond: (context) => context.ticker.length > 0
        },
        RESET: {
          target: 'idle'
        }
      }
    }
  },
  on: {
    TICKER_INPUT: {
      actions: assign({
        ticker: (context, event) => event.ticker
      })
    },
    EXCHANGE_SELECT: {
      actions: assign({
        exchange: (context, event) => event.exchange
      })
    }
  }
});

export default tickerMachine;
