// Stub only — not deployed, not required by the app, and not imported by
// anything in src/. Sketches how a production Coach would route through a
// server instead of embedding an Anthropic API key in the mobile bundle:
//
//   Mobile app --(authenticated request)--> this Edge Function
//              --> Claude API (key lives only in Supabase secrets)
//              --> structured CoachResponse
//              --> mobile app shows it as a proposal, same as DemoCoachProvider
//              --> athlete taps APPLY CHANGE (see src/state/adaptation.ts)
//
// The mobile-side contract this must satisfy is `CoachProvider` in
// src/types/index.ts — sendMessage(message, context) => Promise<CoachResponse>.
// Swapping DemoCoachProvider for a client that POSTs here requires no UI
// changes, because the Coach screen already only depends on that interface.

// @ts-nocheck — this file targets the Deno runtime Supabase Edge Functions
// run on, not the app's React Native/Node toolchain, so it is intentionally
// excluded from this project's tsconfig and not type-checked with the app.

// import { serve } from 'https://deno.land/std/http/server.ts';
//
// serve(async (req) => {
//   const { message, context } = await req.json();
//
//   // 1. Verify the Supabase auth JWT on `req` before doing anything else.
//   // 2. Call Claude with `message` + a summarized `context` (profile,
//   //    training state, active workout) and a system prompt constraining
//   //    it to return a CoachResponse-shaped JSON object.
//   // 3. Never let the model response bypass validation — parse it against
//   //    the CoachResponse/WorkoutAdaptation shape before returning, so a
//   //    malformed model output can't reach the client as if it were a
//   //    valid structured adaptation.
//   // 4. Return { message, proposedAdaptation } — never apply anything
//   //    server-side. The client still requires an explicit APPLY CHANGE.
//
//   return new Response(JSON.stringify({ message: 'not implemented' }), {
//     headers: { 'content-type': 'application/json' },
//   });
// });
