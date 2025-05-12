import React, { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, CircularProgress } from '@mui/material';
import { HeatMapGrid } from 'react-grid-heatmap';

const HeatmapPage = () => {
  const [minutes, setMinutes] = useState(30);
  const [stocks, setStocks] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/evaluation-service/stocks')
      .then(res => res.json())
      .then(json => setStocks(json.stocks));
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      const priceData = {};
      for (const [name, ticker] of Object.entries(stocks)) {
        try {
          const res = await fetch(`/evaluation-service/stocks/${ticker}?minutes=${minutes}`);
          priceData[ticker] = await res.json();
        } catch (err) {
          console.error(`Failed to fetch prices for ${ticker}`, err);
          priceData[ticker] = [];
        }
      }
      setPrices(priceData);
      setLoading(false);
    };

    if (Object.keys(stocks).length > 0) fetchPrices();
  }, [stocks, minutes]);

  const getCorrelation = (a, b) => {
    const aPrices = a.map(p => p.price);
    const bPrices = b.map(p => p.price);
    const minLength = Math.min(aPrices.length, bPrices.length);
    if (minLength < 2) return 0;
    const meanA = aPrices.reduce((acc, val) => acc + val, 0) / aPrices.length;
    const meanB = bPrices.reduce((acc, val) => acc + val, 0) / bPrices.length;
    let cov = 0, stdA = 0, stdB = 0;
    for (let i = 0; i < minLength; i++) {
      const diffA = aPrices[i] - meanA;
      const diffB = bPrices[i] - meanB;
      cov += diffA * diffB;
      stdA += diffA * diffA;
      stdB += diffB * diffB;
    }
    cov /= minLength - 1;
    stdA = Math.sqrt(stdA / (minLength - 1));
    stdB = Math.sqrt(stdB / (minLength - 1));
    return stdA && stdB ? (cov / (stdA * stdB)).toFixed(2) : 0;
  };

  const stockList = Object.values(stocks);
  const heatmap = stockList.map((x, i) =>
    stockList.map((y, j) => getCorrelation(prices[x] || [], prices[y] || []))
  );

  return (
    <Box p={3}>
      <Typography variant="h4">Correlation Heatmap</Typography>
      <Select value={minutes} onChange={e => setMinutes(e.target.value)} sx={{ mt: 2 }}>
        {[10, 30, 60, 120].map(m => (
          <MenuItem value={m} key={m}>{m} mins</MenuItem>
        ))}
      </Select>
      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : (
        <Box mt={3}>
          <HeatMapGrid
            data={heatmap}
            xLabels={stockList}
            yLabels={stockList}
            cellRender={(x, y, value) => `${value}`}
            cellStyle={(_x, _y, value) => ({
              background: `rgba(255, 0, 0, ${Math.abs(value)})`,
              color: 'black'
            })}
          />
        </Box>
      )}
    </Box>
  );
};

export default HeatmapPage;
