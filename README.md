# Real-Time Social Media Hashtag Trends Analyzer

A scalable, real-time application that processes social media data streams to identify and visualize trending hashtags. Built with Node.js, TypeScript, Kafka, and React.

## Features

- Real-time hashtag trend analysis
- Support for multiple data sources (Mocked Data Streams, Twitter API*, Kafka streams)
- AI-enhanced trend analysis with time decay
- Interactive visualization dashboard
- WebSocket-based real-time updates
- Scalable architecture using Apache Kafka

> *Note: Due to recent changes in Twitter's API pricing model, the free tier is limited to 500 API calls per month. This implementation includes Twitter integration code, but deployment would require a paid API subscription for production use.

## Architecture

```
├── Backend (Node.js + TypeScript)
│   ├── Kafka Consumer
│   ├── HashtagAI Analysis
│   ├── WebSocket Server
│   └── REST API
└── Frontend (React + TypeScript)
    ├── Real-time Dashboard
    ├── Trend Visualization
    └── WebSocket Client
```

## Prerequisites

- Node.js 18+
- Apache Kafka 3.0+
- npm or yarn
- Docker

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tumultousRamen/hashtag-streaming.git
cd hashtag-streaming
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# Backend .env
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=social-media-feed
PORT=3000
TWITTER_API_KEY=your_api_key  # Optional
TWITTER_API_SECRET=your_api_secret  # Optional

# Frontend .env
VITE_BACKEND_URL=http://localhost:3000
```

## Running the Application

1. Start Kafka:
```bash
# Using Docker
docker-compose up -d kafka
```

2. Start the backend:
```bash
cd backend
npm run dev
```

3. Start the frontend:
```bash
cd frontend
npm run dev
```

4. Access the dashboard at `http://localhost:5173`

## Testing

Run the test suite:
```bash
cd backend
npm run test
```

### Test Coverage

The application includes comprehensive tests covering:

- Unit tests for all core services
- Integration tests for Kafka pipeline
- WebSocket connection handling
- Input validation and sanitization
- Boundary conditions
- Error handling
- Performance under load

## Implementation Details

### Boundary Conditions & Validations

1. Message Processing
   - Maximum message size: 280 characters (Twitter standard)
   - Maximum hashtags per message: 30
   - Maximum hashtag length: 100 characters
   - Invalid character handling in hashtags
   - Duplicate hashtag handling

2. Trend Analysis
   - Time window: 1 hour rolling window
   - Maximum tracked hashtags: 10,000
   - Minimum occurrence threshold: 2
   - Score decay: Exponential decay over 24 hours

3. Rate Limiting
   - WebSocket connections: 1000 per server
   - API requests: 100 per minute per IP
   - Kafka message processing: 10,000 per second

4. Error Handling
   - Network disconnections
   - Malformed messages
   - API failures
   - Database connection issues

## API Documentation

### REST Endpoints

```typescript
GET /api/trends
Response: HashtagTrend[]

interface HashtagTrend {
    tag: string;
    count: number;
    timestamp: Date;
}
```

### WebSocket Events

```typescript
// Client -> Server
'disconnect': () => void

// Server -> Client
'trends': (trends: HashtagTrend[]) => void
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE.md