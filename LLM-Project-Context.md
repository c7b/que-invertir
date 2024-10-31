# ¿Qué Invertir? - LLM Context Guide

## IMPORTANT: READ BEFORE SUGGESTING CHANGES

### Context Rules

1. **DO NOT** suggest features without reviewing the full codebase context.
2. **DO NOT** propose new providers or authentication systems.
3. **DO NOT** suggest architectural changes without understanding current constraints.

## Project Overview

A Next.js web application that scrapes and compares investment yields from three major Mexican investment platforms: CETES (government bonds), Nu Bank, and SuperTasas. The application provides real-time comparison through a clean interface.

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Scraping**: Puppeteer & Fetch API
- **Caching**: In-memory + Database

## Project Structure

```bash
QUE-INVERTIR/
├── app/
│   ├── api/
│   │   ├── cron/             # Automated 24h updates
│   │   └── scrape/           # Individual and bulk scraping endpoints
│   ├── layout.tsx            # SEO and main layout
│   └── page.tsx              # Main comparison interface
├── lib/
│   ├── scrapers/             # Individual scraper implementations
│   ├── cache.ts              # 5-minute memory cache
│   ├── supabase.ts           # Database operations
│   └── utils.ts              # Shared utilities
└── types/                    # TypeScript definitions
```

## Core Components

### Data Types

```typescript
type Product = {
  name: string;
  yield: number;
  termDays: number;
  originalTerm: string;
};
```

### Core Types

```typescript
export type Provider = 'nu' | 'cetes' | 'supertasas';

export interface ScrapingData {
  provider: Provider;
  date: string;
  products: Product[];
  success: boolean;
  error?: string;
}

export interface DbRecord {
  id: string;
  provider: Provider;
  data: ScrapingData;
  created_at: string;
}
```

### Database Schema

```sql
-- Main table
CREATE TABLE scraping_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_scraping_history_provider ON scraping_history(provider);
CREATE INDEX idx_scraping_history_created_at ON scraping_history(created_at DESC);
```

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=XXX
SUPABASE_SERVICE_ROLE_KEY=XXX
NEXT_PUBLIC_SUPABASE_ANON_KEY=XXX
CRON_SECRET=XXX
```

## Key Code Patterns to Preserve

1. **Scraping Pattern:**

   ```typescript
   export async function scrapeProvider(): Promise<ScrapingData> {
     try {
       // Scraping logic
       return {
         provider: 'provider_name',
         date: new Date().toISOString(),
         products: [...],
         success: true
       };
     } catch (error) {
       // Return fallback data or error
     }
   }
   ```

2. **API Route Pattern:**

   ```typescript
   export async function GET() {
     try {
       const isFresh = await isDataFresh('provider');
       if (isFresh) {
         return cached_data;
       }
       // Scraping and storage logic
     } catch (error) {
       // Error handling
     }
   }
   ```

## API Endpoints

```typescript
// Scraping endpoints
GET /api/scrape/all          // Scrapes all providers
GET /api/scrape/nu           // Scrapes Nu
GET /api/scrape/cetes        // Scrapes CETES
GET /api/scrape/supertasas   // Scrapes SuperTasas

// CRON endpoint (protected)
GET /api/cron                // Triggers daily update
```

## Scraping Methods

1. **CETES:**
   - Direct API call
   - JSON response
   - No browser needed

2. **Nu:**
   - Puppeteer scraping
   - Static fallback data
   - Browser simulation

3. **SuperTasas:**
   - Puppeteer scraping
   - Form interaction
   - Browser simulation

## Cache Implementation

```typescript
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

type CacheItem = {
  data: any;
  timestamp: number;
};

const cache: Map<string, CacheItem> = new Map();
```

- In-memory cache with 5-minute duration
- Automatic invalidation
- Map-based implementation

## Fallback Mechanism

```typescript
// Example of Nu fallback data
const NU_FALLBACK: ScrapingData = {
  provider: 'nu',
  date: new Date().toISOString(),
  products: [
    { name: "Ahorro", yield: 14.50, termDays: 90, originalTerm: "90 días" },
    // ... more fallback products
  ],
  success: true
};
```

- Each provider has its own fallback data
- Fallback triggers on:
  1. Scraping failures
  2. Network errors
  3. Website structure changes

## Error Handling Strategy

1. **Scraping Errors:**
   - Use fallback data
   - Log error details
   - Return partial results

2. **API Errors:**
   - **500**: No successful scrapes
   - **401**: Invalid CRON authentication
   - **200**: Partial success (some providers failed)

3. **Cache Errors:**
   - Fallback to database
   - Reset cache if corrupted

## Current Business Rules

1. **Data Freshness:**
   - Memory cache: 5 minutes
   - Database cache: 24 hours
   - Fallback data: Used when scraping fails

2. **Required Product Fields:**
   - `name` (Spanish)
   - `yield` (number)
   - `termDays` (number)
   - `lastUpdated` (ISO string)

## Data Flow

1. CRON job triggers every 24h
2. Checks 5-minute memory cache
3. If no cache, verifies database freshness
4. If data not fresh, executes scraping
5. Stores results in Supabase
6. Updates memory cache

## SEO Configuration

```typescript
export const metadata: Metadata = {
  title: "¿Qué Invertir? - Comparador de Rendimientos",
  description: "Compara tasas de rendimiento de CETES, Nu y SuperTasas en tiempo real",
  locale: "es_MX",
  type: "website",
};
```

## Current Limitations

- Limited to three providers
- No user authentication
- No historical data tracking
- Daily update maximum frequency
- No yield comparison adjustments

## Development Guidelines

- Maintain TypeScript types
- Follow existing error handling patterns
- Preserve bilingual approach (English code, Spanish UI)
- Keep scraping logic isolated per provider
- Use provided code patterns for consistency

## When Suggesting Optimizations

1. **Focus on:**
   - Error resilience
   - Cache efficiency
   - Type safety
   - Performance

2. **Avoid:**
   - New features
   - Additional dependencies
   - Complex state management
   - Authentication systems