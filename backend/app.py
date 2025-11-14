from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
import tweepy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize MongoDB
mongo_client = MongoClient(os.getenv('MONGODB_URI'))
db = mongo_client[os.getenv('DATABASE_NAME')]
tweets_collection = db['tweets']
keywords_collection = db['keywords']

# Initialize VADER sentiment analyzer
sentiment_analyzer = SentimentIntensityAnalyzer()


# Load all available bearer tokens
BEARER_TOKENS = []
for i in range(1, 10):  # Check for up to 10 API keys
    token = os.getenv(f'TWITTER_BEARER_TOKEN_{i}')
    if token:
        BEARER_TOKENS.append(token)

if not BEARER_TOKENS:
    raise ValueError("No Twitter Bearer Tokens found in .env file!")

current_token_index = 0  # Track which token we're using

def get_twitter_client():
    """Get Twitter client with current bearer token"""
    global current_token_index
    bearer_token = BEARER_TOKENS[current_token_index]
    return tweepy.Client(bearer_token=bearer_token)

def rotate_bearer_token():
    """Switch to next bearer token"""
    global current_token_index
    current_token_index = (current_token_index + 1) % len(BEARER_TOKENS)
    print(f"🔄 Rotated to Bearer Token #{current_token_index + 1} of {len(BEARER_TOKENS)}")
    return current_token_index + 1

def get_current_token_number():
    """Get current token number"""
    return current_token_index + 1

def get_total_tokens():
    """Get total number of tokens"""
    return len(BEARER_TOKENS)


def analyze_sentiment(text):
    """Analyze sentiment using VADER"""
    scores = sentiment_analyzer.polarity_scores(text)
    compound = scores['compound']
    
    # Classification based on compound score
    if compound >= 0.05:
        label = 'positive'
    elif compound <= -0.05:
        label = 'negative'
    else:
        label = 'neutral'
    
    return {
        'label': label,
        'compound': compound,
        'positive': scores['pos'],
        'negative': scores['neg'],
        'neutral': scores['neu']
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok', 
        'message': 'Server is running',
        'current_api_key': get_current_token_number(),
        'total_api_keys': get_total_tokens()
    })

@app.route('/api/search', methods=['POST'])
def search_tweets():
    """Search tweets and analyze sentiment"""
    try:
        data = request.json
        keyword = data.get('keyword', '')
        
        if not keyword:
            return jsonify({'error': 'Keyword is required'}), 400
        
        # Get current Twitter client
        twitter_client = get_twitter_client()
        
        # Search tweets using Twitter API v2
        response = twitter_client.search_recent_tweets(
            query=keyword,
            max_results=10,
            tweet_fields=['created_at', 'author_id', 'public_metrics']
        )
        
        tweets_data = []
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        if response.data:
            for tweet in response.data:
                # Analyze sentiment
                sentiment = analyze_sentiment(tweet.text)
                sentiment_counts[sentiment['label']] += 1
                
                # Prepare tweet document
                tweet_doc = {
                    'tweet_id': str(tweet.id),
                    'text': tweet.text,
                    'keyword': keyword,
                    'created_at': tweet.created_at,
                    'sentiment': sentiment,
                    'engagement': {
                        'likes': tweet.public_metrics['like_count'],
                        'retweets': tweet.public_metrics['retweet_count'],
                        'replies': tweet.public_metrics['reply_count']
                    },
                    'fetched_at': datetime.utcnow()
                }
                
                # Store in MongoDB
                tweets_collection.insert_one(tweet_doc)
                
                # Remove MongoDB _id for JSON serialization
                tweet_doc.pop('_id')
                tweet_doc['created_at'] = str(tweet_doc['created_at'])
                tweet_doc['fetched_at'] = str(tweet_doc['fetched_at'])
                
                tweets_data.append(tweet_doc)
            
            # Update keyword statistics
            keywords_collection.update_one(
                {'keyword': keyword},
                {
                    '$set': {
                        'last_updated': datetime.utcnow(),
                        'total_tweets': len(tweets_data),
                        'sentiment_summary': sentiment_counts
                    }
                },
                upsert=True
            )
            
            # Emit real-time update via WebSocket
            socketio.emit('new_tweets', {
                'keyword': keyword,
                'tweets': tweets_data,
                'sentiment_summary': sentiment_counts,
                'current_api_key': get_current_token_number(),
                'total_api_keys': get_total_tokens()
            })
            
            return jsonify({
                'success': True,
                'keyword': keyword,
                'tweets': tweets_data,
                'sentiment_summary': sentiment_counts,
                'current_api_key': get_current_token_number(),
                'total_api_keys': get_total_tokens()
            })
        else:
            return jsonify({
                'success': True,
                'keyword': keyword,
                'tweets': [],
                'sentiment_summary': sentiment_counts,
                'message': 'No tweets found',
                'current_api_key': get_current_token_number(),
                'total_api_keys': get_total_tokens()
            })
            
    except tweepy.TweepyException as e:
        error_message = str(e)
        print(f"❌ Twitter API Error: {error_message}")
        
        # Check for rate limit error (429)
        if "429" in error_message or "rate limit" in error_message.lower():
            print(f"Rate limit hit for token #{get_current_token_number()}")
            new_token_num = rotate_bearer_token()
            return jsonify({
                'error': f'Rate limit hit on API Key #{get_current_token_number() - 1}. Switched to API Key #{new_token_num}. Please try again.',
                'retry': True,
                'current_api_key': get_current_token_number(),
                'total_api_keys': get_total_tokens()
            }), 429
        else:
            return jsonify({
                'error': f'Twitter API error: {error_message}',
                'current_api_key': get_current_token_number(),
                'total_api_keys': get_total_tokens()
            }), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/tweets/<keyword>', methods=['GET'])
def get_tweets(keyword):
    """Get stored tweets for a keyword"""
    try:
        tweets = list(tweets_collection.find(
            {'keyword': keyword}
        ).sort('created_at', -1).limit(50))
        
        # Convert ObjectId to string
        for tweet in tweets:
            tweet['_id'] = str(tweet['_id'])
            tweet['created_at'] = str(tweet['created_at'])
            tweet['fetched_at'] = str(tweet['fetched_at'])
        
        return jsonify({
            'tweets': tweets,
            'current_api_key': get_current_token_number(),
            'total_api_keys': get_total_tokens()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print('✅ Client connected')
    emit('connected', {
        'message': 'Connected to PulseTrack server',
        'current_api_key': get_current_token_number(),
        'total_api_keys': get_total_tokens()
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print('❌ Client disconnected')

if __name__ == '__main__':
    print(f"🚀 Starting PulseTrack with {get_total_tokens()} API keys loaded")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
