import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SentimentChart from './components/SentimentChart';
import TweetList from './components/TweetList';
import TrendingKeywords from './components/TrendingKeywords';
import SentimentTimeline from './components/SentimentTimeline';
import EngagementMetrics from './components/EngagementMetrics';
import { searchTweets } from './services/api';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

function App() {
  const [tweets, setTweets] = useState([]);
  const [sentimentData, setSentimentData] = useState({ positive: 0, negative: 0, neutral: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const { socket, isConnected } = useWebSocket();
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentApiKey, setCurrentApiKey] = useState(1);
  const [totalApiKeys, setTotalApiKeys] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on('new_tweets', (data) => {
        console.log('Received real-time update:', data);
        setTweets(data.tweets);
        setSentimentData(data.sentiment_summary);
        if (data.current_api_key) setCurrentApiKey(data.current_api_key);
        if (data.total_api_keys) setTotalApiKeys(data.total_api_keys);
      });

      socket.on('connected', (data) => {
        console.log(data.message);
        if (data.current_api_key) setCurrentApiKey(data.current_api_key);
        if (data.total_api_keys) setTotalApiKeys(data.total_api_keys);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_tweets');
        socket.off('connected');
      }
    };
  }, [socket]);

  const handleSearch = async (keyword) => {
    setIsLoading(true);
    setCurrentKeyword(keyword);
    
    if (!searchHistory.includes(keyword)) {
      setSearchHistory([keyword, ...searchHistory.slice(0, 4)]);
    }

    try {
      const result = await searchTweets(keyword);
      setTweets(result.tweets || []);
      setSentimentData(result.sentiment_summary || { positive: 0, negative: 0, neutral: 0 });
      if (result.current_api_key) setCurrentApiKey(result.current_api_key);
      if (result.total_api_keys) setTotalApiKeys(result.total_api_keys);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search tweets. Please try again or the API rate limit may have been hit.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallSentiment = () => {
    const total = sentimentData.positive + sentimentData.negative + sentimentData.neutral;
    if (total === 0) return 0;
    return (sentimentData.positive - sentimentData.negative) / total;
  };

  const exportToCSV = () => {
    if (tweets.length === 0) {
      alert('No tweets to export');
      return;
    }

    let csv = 'Tweet,Sentiment,Likes,Retweets,Replies,Created At\n';
    tweets.forEach(tweet => {
      const text = `"${tweet.text.replace(/"/g, '""')}"`;
      csv += `${text},${tweet.sentiment.label},${tweet.engagement.likes},${tweet.engagement.retweets},${tweet.engagement.replies},${tweet.created_at}\n`;
    });
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `tweets_${currentKeyword}_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)', padding: '30px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', letterSpacing: '-1px' }}>🔥 PulseTrack</h1>
        <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '300' }}>Real-time Social Media Sentiment Dashboard</p>
        
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', backdropFilter: 'blur(10px)' }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', backdropFilter: 'blur(10px)' }}>
            🔑 API Key: {currentApiKey}/{totalApiKeys}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {searchHistory.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>📋 Recent Searches:</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {searchHistory.map((keyword, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(keyword)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#00D4FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0099CC'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#00D4FF'}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentKeyword && (
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
            📊 Results for: "{currentKeyword}"
          </h2>
        )}

        {tweets.length > 0 && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Overall Sentiment Score</h4>
            <div style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#e0e0e0',
              borderRadius: '15px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${(calculateOverallSentiment() + 1) * 50}%`,
                height: '100%',
                backgroundColor: calculateOverallSentiment() > 0 ? '#4CAF50' : calculateOverallSentiment() < 0 ? '#F44336' : '#9E9E9E',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {calculateOverallSentiment() > 0 ? '😊 Positive' : calculateOverallSentiment() < 0 ? '😞 Negative' : '😐 Neutral'}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <SentimentChart sentimentData={sentimentData} />

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '20px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{sentimentData.positive}</div>
                <div style={{ fontSize: '12px' }}>😊 Positive</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#F44336', color: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{sentimentData.negative}</div>
                <div style={{ fontSize: '12px' }}>😞 Negative</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#9E9E9E', color: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{sentimentData.neutral}</div>
                <div style={{ fontSize: '12px' }}>😐 Neutral</div>
              </div>
            </div>

            {tweets.length > 0 && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <button 
                  onClick={exportToCSV}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#00D4FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0099CC'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#00D4FF'}
                >
                  📥 Export to CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NEW: Trending Keywords */}
        {tweets.length > 0 && <TrendingKeywords tweets={tweets} searchHistory={searchHistory} />}

        {/* NEW: Engagement Metrics */}
        {tweets.length > 0 && <EngagementMetrics tweets={tweets} />}

        {/* NEW: Sentiment Timeline */}
        {tweets.length > 0 && <SentimentTimeline tweets={tweets} />}

        {/* Tweets List */}
        <TweetList tweets={tweets} />

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px', color: '#999', fontSize: '12px', borderTop: '1px solid #ddd' }}>
          <p>© 2025 PulseTrack | BITS Pilani BSc Design & Computing Project</p>
          <p>Total API Keys Available: {totalApiKeys} | Currently Using: {currentApiKey}</p>
          <p>Version 2.0 - Enhanced with Advanced Analytics</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
