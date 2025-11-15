import React from 'react';

const EngagementMetrics = ({ tweets }) => {
  const calculateMetrics = () => {
    if (tweets.length === 0) {
      return { totalLikes: 0, totalRetweets: 0, totalReplies: 0, avgEngagement: 0, topTweet: null };
    }

    let totalLikes = 0;
    let totalRetweets = 0;
    let totalReplies = 0;
    let topTweet = tweets[0];

    tweets.forEach(tweet => {
      totalLikes += tweet.engagement.likes;
      totalRetweets += tweet.engagement.retweets;
      totalReplies += tweet.engagement.replies;

      const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
      const topEngagement = topTweet.engagement.likes + topTweet.engagement.retweets + topTweet.engagement.replies;

      if (totalEngagement > topEngagement) {
        topTweet = tweet;
      }
    });

    const avgEngagement = (totalLikes + totalRetweets + totalReplies) / tweets.length;

    return { totalLikes, totalRetweets, totalReplies, avgEngagement, topTweet };
  };

  const metrics = calculateMetrics();

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>📊 Engagement Analytics</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #2196F3' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>❤️ {metrics.totalLikes}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Likes</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#E8F5E9', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #4CAF50' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>🔄 {metrics.totalRetweets}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Retweets</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#FFF3E0', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #FF9800' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>💬 {metrics.totalReplies}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Replies</div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#F3E5F5', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #9C27B0' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>📈 {Math.round(metrics.avgEngagement)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Avg Per Tweet</div>
        </div>
      </div>

      {metrics.topTweet && (
        <div style={{ padding: '15px', backgroundColor: '#FFF9C4', borderRadius: '8px', borderLeft: '4px solid #FBC02D' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#F57F17' }}>🏆 Most Engaged Tweet</h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5' }}>"{metrics.topTweet.text.substring(0, 100)}..."</p>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ❤️ {metrics.topTweet.engagement.likes} | 🔄 {metrics.topTweet.engagement.retweets} | 💬 {metrics.topTweet.engagement.replies}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementMetrics;
