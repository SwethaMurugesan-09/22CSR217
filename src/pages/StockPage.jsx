import React, { useEffect, useState } from 'react';
import { Typography, Select, MenuItem, CircularProgress, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const STOCK_API = '/evaluation-service/stocks';

const StockPage = () => {
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState('NVDA');
  const [minutes, setMinutes] = useState(30);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(STOCK_API)
      .then(res => res.json())
      .then(json => setStocks(json.stocks));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${STOCK_API}/${selectedStock}?minutes=${minutes}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch data for ${selectedStock}`, err);
        setLoading(false);
      });
  }, [selectedStock, minutes]);

  const chartData = {
    labels: data.map(d => new Date(d.lastUpdatedAt).toLocaleTimeString()),
    datasets: [
      {
        label: 'Price',
        data: data.map(d => d.price),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
      {
        label: 'Average',
        data: Array(data.length).fill(data.reduce((a, b) => a + b.price, 0) / data.length || 0),
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Stock Price Chart</Typography>
      <Box my={2}>
        <Select value={selectedStock} onChange={e => setSelectedStock(e.target.value)}>
          {Object.entries(stocks).map(([name, symbol]) => (
            <MenuItem value={symbol} key={symbol}>{name}</MenuItem>
          ))}
        </Select>
        <Select value={minutes} onChange={e => setMinutes(e.target.value)} sx={{ ml: 2 }}>
          {[10, 30, 60, 120].map(min => (
            <MenuItem value={min} key={min}>{min} mins</MenuItem>
          ))}
        </Select>
      </Box>
      {loading ? <CircularProgress /> : <Line data={chartData} />}
    </Box>
  );
};

export default StockPage;
