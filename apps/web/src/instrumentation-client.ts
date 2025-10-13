// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://044442f0ff29eff206fa6f3567617b7b@o4510178325430272.ingest.us.sentry.io/4510178325626880",
  
  // Lower sampling rates for better performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
