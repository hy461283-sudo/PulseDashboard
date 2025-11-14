import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN')
    MONGODB_URI = os.getenv('MONGODB_URI')
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = True
