# Automotive RAG Chat App

A Next.js application that provides an intelligent automotive chat interface powered by RAG (Retrieval-Augmented Generation) technology. Users can ask questions about cars and receive personalized recommendations based on a comprehensive automotive database.

## Features

- 🤖 **AI-Powered Chat Interface**: Intelligent conversation flow with OpenAI GPT-4o-mini
- 🔍 **Vector Search**: Pinecone-powered semantic search through automotive data
- 🗄️ **Database Integration**: Supabase PostgreSQL database with car specifications
- 🎨 **Modern UI**: Responsive design with Tailwind CSS and dark theme
- 🚗 **Car Recommendations**: Dynamic car cards with images and detailed specifications
- 🔧 **Testing Endpoints**: Built-in API endpoints for testing integrations

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini
- **Vector Database**: Pinecone
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables (see Environment Setup)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd automotive-rag
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env.local`):
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_HOST_URL=your_pinecone_host_url
PINECONE_INDEX_NAME=automotive
PINECONE_NAMESPACE=ns1

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PASSWORD=your_supabase_password

# Image Storage
BUCKET_URL=your_image_bucket_url
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/rag` - Main RAG endpoint for chat interactions
- `GET /api/supabase-test` - Test Supabase connection
- `POST /api/test-openai` - Test OpenAI integration
- `POST /api/test-pinecone` - Test Pinecone vector search
- `GET /api/db-test` - Test direct database connection
- `GET /api/image-test` - Test image URL composition

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.js      # Root layout
│   └── page.js        # Main chat interface
├── components/
│   ├── CarCard.js     # Car recommendation cards
│   ├── Header.js      # Application header
│   ├── LoadingIndicator.js
│   └── Message.js     # Chat message component
├── data/
│   └── mockData.js    # Mock data and conversation flows
└── lib/
    ├── openaiUtil.js  # OpenAI integration
    ├── pineconeUtil.js # Pinecone vector search
    └── supabaseServer.js # Supabase client
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all required environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_HOST_URL`
- `PINECONE_INDEX_NAME`
- `PINECONE_NAMESPACE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PASSWORD`
- `BUCKET_URL`

## Usage

1. Start a conversation by greeting the assistant
2. Ask about cars, budgets, or specific features
3. Receive personalized car recommendations
4. View detailed car cards with specifications and images

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.