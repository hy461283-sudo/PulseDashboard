import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentTimeline = ({ tweets }) => {
  // Prepare data for timeline
  const prepareTimelineData = () => {
    if (tweets.length === 0) return [];

    // Group tweets by hour
    const grouped = {};
    tweets.forEach(tweet => {
      const date = new Date(tweet.created_at);
      const hour = date.getHours();
      const label = `${hour}:00`;

      if (!grouped[label]) {
        grouped[label] = { positive: 0, negative: 0, neutral: 0, label };
      }

      grouped[label][tweet.sentiment.label]++;
    });

    return Object.values(grouped).sort((a, b) => parseInt(a.label) - parseInt(b.label));
  };

  const data = prepareTimelineData();

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>📈 Sentiment Timeline</h3>
      {data.length === 0 ? (
        <p style={{ color: '#999', margin: 0 }}>No timeline data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#4CAF50" name="Positive" strokeWidth={2} />
            <Line type="monotone" dataKey="negative" stroke="#F44336" name="Negative" strokeWidth={2} />
            <Line type="monotone" dataKey="neutral" stroke="#9E9E9E" name="Neutral" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SentimentTimeline;
