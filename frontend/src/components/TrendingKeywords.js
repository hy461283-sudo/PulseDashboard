import React, { useEffect, useState } from 'react';

const TrendingKeywords = ({ tweets, searchHistory }) => {
  const [trendingWords, setTrendingWords] = useState([]);

  useEffect(() => {
    if (tweets.length === 0) return;

    // Extract and count keywords from tweets
    const wordCount = {};
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'rt'];

    tweets.forEach(tweet => {
      const words = tweet.text
        .toLowerCase()
        .match(/\b[\w']+\b/g) || [];
      
      words.forEach(word => {
        if (word.length > 3 && !stopWords.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    // Get top 10 trending words
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    setTrendingWords(sorted);
  }, [tweets]);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🔥 Trending Words</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {trendingWords.length === 0 ? (
          <p style={{ color: '#999', margin: 0 }}>No trending words yet. Search for keywords first.</p>
        ) : (
          trendingWords.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                backgroundColor: `hsla(${idx * 30}, 100%, 60%, 0.2)`,
                border: `2px solid hsl(${idx * 30}, 100%, 60%)`,
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: `hsl(${idx * 30}, 100%, 40%)`,
                position: 'relative'
              }}
            >
              {item.word}
              <span style={{
                marginLeft: '5px',
                backgroundColor: `hsl(${idx * 30}, 100%, 60%)`,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px'
              }}>
                {item.count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingKeywords;
