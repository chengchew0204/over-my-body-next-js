# 跨我身體 OVER MY BODY

A Taiwan-based experimental music label website built with Next.js, preserving the original design and layout patterns.

## Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React Server Components** for optimal performance
- **Custom CSS** (preserved from original design)

## Features

- **Fixed Corner Layout**: Four persistent UI elements that remain fixed across all routes
- **Route-based Content**: Real Next.js routes replace hash-based navigation
- **Responsive Design**: Mobile-optimized layout with adaptive corner positioning
- **SEO Optimized**: Server-side rendering with proper metadata
- **Vercel Ready**: Optimized for deployment on Vercel platform

## Routes

- `/` - Homepage with main visual background
- `/releases` - Music catalog with Bandcamp integration
- `/store` - Physical releases and merchandise
- `/info` - Contact and submission information

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/chengchew0204/over-my-body-website.git
cd over-my-body-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment on Vercel

### Quick Deploy

1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Vercel will automatically detect Next.js and deploy

### Manual Configuration

No special build settings required. Vercel will automatically:
- Detect Next.js framework
- Use `npm run build` as build command
- Set output directory to `.next`
- Enable HTTPS and custom domains

### Environment Variables

Currently no environment variables are required for basic functionality.

## Architecture Notes

### Design Preservation

The migration preserves the original design by:
- Maintaining exact CSS class names and selectors
- Preserving the four-corner fixed layout structure  
- Keeping original asset paths under `/public/asset`
- Converting hash-based routing to real Next.js routes without visual changes

### CSS Architecture

- `src/app/globals.css` - Consolidated CSS from original `/css` directory
- No CSS-in-JS or Tailwind - uses original custom CSS
- Responsive breakpoints preserved from original design
- CSS variables for design tokens maintained

### Component Structure

- `src/app/layout.tsx` - Root layout with four fixed corners
- `src/components/Navigation.tsx` - Client component for navigation state
- `src/components/BodyClassManager.tsx` - Manages route-specific body classes
- Route pages in `src/app/*/page.tsx` - Server components for each route

## Future Enhancements

Stub files are included for future features:

- `src/lib/bandcamp.ts` - Bandcamp API integration for dynamic releases
- `src/lib/cms.ts` - CMS integration for store products
- `src/app/api/revalidate/route.ts` - On-demand revalidation for external content

## License

All rights reserved - OVER MY BODY collective.