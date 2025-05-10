# AI Weather Assistant

An intelligent weather application that combines real-time weather data with AI-powered insights. Get comprehensive weather information and personalized recommendations based on current conditions.

![AI Weather Assistant](public/screenshot.png)

## Features

- **Real-time Weather Data**: Get current weather conditions for any location worldwide using the Open-Meteo API
- **AI-Generated Insights**: Receive weather descriptions, health tips, fashion advice, and recommended activities
- **Interactive Chat**: Ask questions about the weather and receive AI-generated responses
- **7-Day Forecast**: View upcoming weather conditions with daily forecasts
- **Dynamic UI**: Enjoy a responsive interface with animations and weather-appropriate styling

## Tech Stack

- **Next.js**: React framework for the frontend application
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Mastra**: AI agent framework for intelligent responses
- **Google Gemini**: Powers the AI insights and chat functionality
- **Open-Meteo API**: Provides weather data with no API key required
- **Turso (LibSQL)**: Serverless SQLite database for storage

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-weather-assistant.git
cd ai-weather-assistant
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

### Running the Application

1. Start the development server
```bash
npm run dev
# or
pnpm dev
```

2. In a separate terminal, start the Mastra agent server
```bash
npm run mastra
# or
pnpm mastra
```

Alternatively, you can use the combined script to start both servers:
```bash
npm run dev:all
# or
pnpm dev:all
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Deployment

### Building for Production

To build the application for production:

```bash
npm run build
# or
pnpm build
```

### Deploying to Vercel

This application requires specific configuration for successful deployment to Vercel:

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import your project to [Vercel](https://vercel.com/new)
3. In the Vercel dashboard under your project's "Settings" > "Environment Variables", add:

   - `DATABASE_URL` - Your Turso database URL (format: `libsql://your-database-url-here`)
   - `GOOGLE_API_KEY` - Your Google API key for Gemini model access
   - `WEATHER_API_KEY` - Your weather API key (if required)

4. Deploy your application

#### Setting up a Turso Database

The application uses [Turso](https://turso.tech/) (a serverless SQLite provider) for database storage:

1. Create a Turso account at [turso.tech](https://turso.tech)
2. Install the Turso CLI: `curl -sSfL https://get.turso.tech | bash`
3. Login to Turso: `turso auth login`
4. Create a new database: `turso db create manstra-weather`
5. Get your database URL: `turso db show --url manstra-weather`
6. Add this URL to your Vercel environment variables as `DATABASE_URL`

For local development, the app will fall back to file-based SQLite automatically if no `DATABASE_URL` is provided.

#### Custom Domain Setup

1. Purchase a domain from a domain registrar
2. In your hosting platform (e.g., Vercel), go to the Domains settings
3. Add your custom domain
4. Configure your DNS settings according to the instructions provided by your hosting platform
5. Wait for DNS propagation (may take up to 48 hours)

## Project Structure

```
manstra-weather-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-insights/
│   │   │   │   └── route.ts
│   │   │   └── weather/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── mastra/
│       ├── agents/
│       │   └── index.ts
│       ├── tools/
│       │   └── index.ts
│       └── index.ts
├── public/
├── .next/
└── node_modules/
```

## API Endpoints

### `/api/weather`
- Method: POST
- Request Body: `{ location: string }`
- Response: Weather data for the specified location

### `/api/ai-insights`
- Method: POST
- Request Body: `{ location: string, conditions: string, temperature: number, message?: string }`
- Response: AI-generated insights about the weather conditions

## Troubleshooting Deployment

### Module not found errors

If you encounter errors like `Cannot find module 'libsql'` when deploying to Vercel, please ensure:

1. The `libsql` package is listed in your `package.json` dependencies
2. Your `next.config.js` file includes `transpilePackages: ['libsql', '@libsql/client', '@mastra/libsql']`
3. You've set up the `DATABASE_URL` environment variable in Vercel

### Database connection issues

If you have database connection issues:

1. Check that your Turso database is accessible from Vercel's regions
2. Verify your database URL has the correct format: `libsql://your-database-url-here`
3. Ensure your database permissions allow connections from Vercel

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Open-Meteo](https://open-meteo.com/) for providing free weather API access
- [Mastra](https://mastra.ai/) for the AI agent framework
- [Next.js](https://nextjs.org/) for the application framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Turso](https://turso.tech/) for serverless SQLite database
