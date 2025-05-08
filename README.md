# Manstra Weather App

This is a Next.js application that utilizes AI weather features, built as an extension of the Manstra AI project. It allows users to search for weather information for any location.

## Features

- Real-time weather data lookup
- Location-based weather reporting
- Clean and responsive UI
- Built with Next.js and TypeScript

## Weather Information Provided

- Current temperature
- "Feels like" temperature
- Humidity levels
- Wind speed and gust information
- Weather conditions description

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app/api/weather` - API routes for weather data
- `/src/mastra` - Mastra AI integration (prepared for future use)
- `/src/app/page.tsx` - Main UI component

## Technical Implementation

The app uses the Open-Meteo free weather API for retrieving weather data, which includes:

1. Geocoding to convert location names to coordinates
2. Fetching current weather data
3. Processing and displaying the weather information

## Integration with Manstra AI

This project is designed to be integrated with Manstra AI for more advanced features:

- Weather pattern analysis
- Natural language queries for weather information
- Context-aware weather recommendations

## Developing Locally

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Open-Meteo API](https://open-meteo.com/)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
