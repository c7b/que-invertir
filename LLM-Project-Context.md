# ¿Qué Invertir? - LLM Context Guide

## IMPORTANT: READ BEFORE SUGGESTING CHANGES

### Context Rules

1. **DO NOT** suggest features without reviewing the full codebase context.
2. **DO NOT** propose new providers or authentication systems.
3. **DO NOT** suggest architectural changes without understanding current constraints.

## Project Overview

A Next.js web application that scrapes and compares investment yields from major Mexican investment platforms including CETES, Nu Bank, SuperTasas, Finsus, Klar, Stori, Covalto, and Kubo. The application provides real-time comparison through a clean interface.

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
     let browser;
     try {
       browser = await puppeteer.launch({ headless: true });
       // Scraping logic
       return {
         provider: 'provider_name',
         date: new Date().toISOString(),
         products: [...],
         success: true
       };
     } catch (error) {
       if (browser) await browser.close();
       throw error; // Let API route handle errors
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

1. **Direct API Call:**
   - CETES (government bonds)
   - Simple fetch requests
   - JSON response parsing

2. **Puppeteer Scraping:**
   - Nu
   - SuperTasas
   - Finsus
   - Klar
   - Stori
   - Covalto
   - Kubo
   - Browser simulation
   - DOM parsing

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


## Error Handling Strategy

1. **Scraping Errors:**
   - Log error details
   - Throw error to API route
   - No fallback data

2. **API Errors:**
   - **500**: Failed scraping
   - **401**: Invalid CRON authentication
   - **200**: Successful scrape

## Current Business Rules

1. **Data Freshness:**
   - Memory cache: 5 minutes
   - Database cache: 24 hours

2. **Required Product Fields:**
   - `name` (Spanish)
   - `yield` (number)
   - `termDays` (number)
   - `originalTerm` (string)

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