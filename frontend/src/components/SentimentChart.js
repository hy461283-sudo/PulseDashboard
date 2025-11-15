import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  positive: '#4CAF50',
  negative: '#F44336',
  neutral: '#9E9E9E'
};

const SentimentChart = ({ sentimentData }) => {
  const data = [
    { name: 'Positive', value: sentimentData.positive || 0 },
    { name: 'Negative', value: sentimentData.negative || 0 },
    { name: 'Neutral', value: sentimentData.neutral || 0 }
  ];

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;
