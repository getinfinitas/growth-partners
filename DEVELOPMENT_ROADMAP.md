# INFINITAS DEVELOPMENT ROADMAP

## PROJECT ARCHITECTURE

### App Structure
```
apps/web/src/
├── app/
│   ├── layout.tsx                    ← Root layout
│   │
│   ├── (site)/                      ← Marketing site route group
│   │   ├── layout.tsx              ← Marketing layout (no sidebar)
│   │   ├── page.tsx                ← Landing page (/)
│   │   ├── pricing/
│   │   │   └── page.tsx            ← /pricing
│   │   └── features/
│   │       └── page.tsx            ← /features
│   │
│   ├── (dashboard)/                 ← Dashboard route group
│   │   ├── layout.tsx              ← Dashboard layout (with sidebar)
│   │   ├── page.tsx                ← Dashboard home (/) - when logged in
│   │   ├── contacts/
│   │   │   └── page.tsx            ← /contacts (CRM)
│   │   ├── properties/
│   │   │   └── page.tsx            ← /properties (CRM)
│   │   ├── profiles/
│   │   │   └── page.tsx            ← /profiles (GBP)
│   │   ├── sites/
│   │   │   └── page.tsx            ← /sites (CMS)
│   │   └── settings/
│   │       └── page.tsx            ← /settings
│   │
│   ├── sites/                       ← Customer CMS sites
│   │   └── [domain]/
│   │       └── [...slug]/
│   │           └── page.tsx        ← customer.infinitas.app/*
│   │
│   └── api/                        ← API routes
│
└── components/
    ├── ui/                         ← SHARED UI COMPONENTS (shadcn/ui)
    │   ├── button.tsx             ← Used everywhere
    │   ├── card.tsx               ← Used everywhere
    │   ├── input.tsx              ← Used everywhere
    │   ├── sidebar.tsx            ← Sidebar component
    │   └── ...                    ← All shadcn components
    │
    ├── dashboard/                  ← DASHBOARD-ONLY COMPONENTS
    │   ├── app-sidebar.tsx        ← Main sidebar (dashboard only)
    │   ├── nav-main.tsx           ← Navigation (dashboard only)
    │   ├── nav-user.tsx           ← User menu (dashboard only)
    │   └── team-switcher.tsx      ← Team switcher (dashboard only)
    │
    ├── marketing/                  ← MARKETING-ONLY COMPONENTS
    │   ├── hero.tsx               ← Landing page hero
    │   ├── pricing-cards.tsx      ← Pricing tiers
    │   └── feature-grid.tsx       ← Feature showcase
    │
    ├── crm/                       ← CRM MODULE COMPONENTS
    │   ├── contact-table.tsx      ← Contact listing
    │   ├── contact-form.tsx       ← Contact CRUD
    │   └── property-card.tsx      ← Property display
    │
    ├── gbp/                       ← GBP MODULE COMPONENTS
    │   ├── profile-card.tsx       ← GBP profile display
    │   ├── posts-manager.tsx      ← Manage GBP posts
    │   └── reviews-viewer.tsx     ← View reviews
    │
    ├── cms/                       ← CMS MODULE COMPONENTS
    │   ├── site-builder.tsx       ← Site builder interface
    │   ├── template-picker.tsx    ← Template selection
    │   └── page-editor.tsx        ← Page content editor
    │
    └── shared/                    ← SHARED BUSINESS COMPONENTS
        ├── tier-gate.tsx          ← Pricing tier access control
        ├── upgrade-prompt.tsx     ← Upgrade messaging
        └── feature-toggle.tsx     ← Feature flag wrapper
```

## DEVELOPMENT PHASES

### PHASE 1: FOUNDATION (Current)
- [x] Clean up incorrect packages/ui structure
- [x] Establish correct Next.js App Router structure  
- [x] Verify build and deployment works
- [ ] Set up middleware for route group switching (auth-based)
- [ ] Create base dashboard layout with sidebar
- [ ] Implement tier-based access control system

### PHASE 2: CORE CRM MODULE
- [ ] Contacts CRUD (Create, Read, Update, Delete)
- [ ] Properties CRUD
- [ ] Activities tracking
- [ ] Basic search and filtering
- [ ] Contact-property relationships

### PHASE 3: GBP MODULE
- [ ] Google Business Profile OAuth integration
- [ ] Profile sync and caching
- [ ] Posts management
- [ ] Reviews display
- [ ] Analytics dashboard

### PHASE 4: CMS MODULE
- [ ] Site builder interface
- [ ] Page templates system
- [ ] Domain management (subdomains + custom domains)
- [ ] Content editor
- [ ] Site preview and publish

### PHASE 5: MARKETING SITE
- [ ] Landing page with feature highlights
- [ ] Pricing page with tier comparison
- [ ] Feature showcase pages
- [ ] Contact/demo request forms

### PHASE 6: ADVANCED FEATURES
- [ ] Advanced analytics across modules
- [ ] Team collaboration features
- [ ] API access for enterprise tier
- [ ] Webhooks and integrations

## COMPONENT USAGE RULES

### SHARED UI COMPONENTS (`components/ui/`)
**USE EVERYWHERE** - These are shadcn/ui components:
- `Button`, `Input`, `Card`, `Dialog`, `Dropdown`, etc.
- Import: `import { Button } from '@/components/ui/button'`

### DASHBOARD COMPONENTS (`components/dashboard/`)
**DASHBOARD LAYOUT ONLY** - Navigation and layout:
- `app-sidebar.tsx` - Main sidebar with navigation
- `nav-main.tsx` - Main navigation menu
- `nav-user.tsx` - User dropdown menu
- Import: `import { AppSidebar } from '@/components/dashboard/app-sidebar'`

### MODULE COMPONENTS (`components/{crm,gbp,cms}/`)
**MODULE-SPECIFIC** - Business logic components:
- Each module has its own folder
- Components only used within that module
- Import: `import { ContactTable } from '@/components/crm/contact-table'`

### SHARED BUSINESS COMPONENTS (`components/shared/`)
**CROSS-MODULE** - Business logic used across modules:
- `TierGate` - Controls access based on pricing tier
- `UpgradePrompt` - Shows upgrade messaging
- Import: `import { TierGate } from '@/components/shared/tier-gate'`

## PRICING TIER ACCESS CONTROL

### Database Schema (Already Exists)
```sql
CREATE TYPE pricing_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');

CREATE TABLE pricing_tiers (
    tier pricing_tier UNIQUE NOT NULL,
    features JSONB  -- Controls module access
);
```

### Feature Control Example
```json
{
  "crm_enabled": true,
  "gbp_enabled": true,
  "cms_enabled": false,
  "max_contacts": 1000,
  "max_gbp_locations": 5,
  "custom_domains": false
}
```

### Access Control Implementation
```typescript
// TierGate component usage
<TierGate feature="cms" fallback={<UpgradePrompt />}>
  <CMSBuilder />
</TierGate>
```

## ROUTING LOGIC

### Authentication Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isLoggedIn = checkAuth(request);
  
  if (request.nextUrl.pathname === '/') {
    if (isLoggedIn) {
      // Show dashboard route group
      return NextResponse.rewrite('/dashboard')
    } else {
      // Show marketing route group  
      return NextResponse.rewrite('/site')
    }
  }
}
```

## DEPLOYMENT ARCHITECTURE

### Single App Deployment
- **Main Domain**: `infinitas.app` - Marketing + Dashboard
- **Customer Sites**: `*.infinitas.app` - CMS sites via wildcard
- **Custom Domains**: CNAME to Vercel for customer sites

### Vercel Configuration
```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "(?<subdomain>[^.]+)\\.infinitas\\.app"}],
      "destination": "/sites/:subdomain/:path*"
    }
  ]
}
```

## NEXT STEPS

1. **Implement middleware for route group switching**
2. **Create dashboard layout with sidebar**  
3. **Build tier-based access control system**
4. **Start with CRM module (contacts/properties)**
5. **Add GBP integration**
6. **Build CMS system**
7. **Complete marketing site**

## NAMING CONVENTIONS

- **Components**: PascalCase (`ContactTable.tsx`)
- **Files**: kebab-case (`contact-table.tsx`)
- **Routes**: lowercase (`/contacts`, `/profiles`)
- **Database**: snake_case (`pricing_tier`, `organization_id`)

This roadmap provides the structure and rules for building all modules without duplication or confusion.