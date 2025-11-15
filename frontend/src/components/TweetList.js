import React from 'react';

const TweetList = ({ tweets }) => {
  const getSentimentColor = (label) => {
    switch (label) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      case 'neutral': return '#9E9E9E';
      default: return '#000';
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Tweets ({tweets.length})</h3>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {tweets.length === 0 ? (
          <p style={{ color: '#666' }}>No tweets to display. Search for a keyword to get started.</p>
        ) : (
          tweets.map((tweet, index) => (
            <div
              key={tweet.tweet_id || index}
              style={{
                padding: '15px',
                marginBottom: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                borderLeft: `4px solid ${getSentimentColor(tweet.sentiment.label)}`
              }}
            >
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{tweet.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getSentimentColor(tweet.sentiment.label),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {tweet.sentiment.label.toUpperCase()}
                </span>
                <span>
                  ❤️ {tweet.engagement.likes} | 🔄 {tweet.engagement.retweets} | 💬 {tweet.engagement.replies}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TweetList;
