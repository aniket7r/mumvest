# MumVest - Remaining Gaps & TODOs

Full audit against `docs/product-specification.md`. Organized by priority.

---

## HIGH PRIORITY (Core features from spec)

- [x] 1. **Add Level 3 lessons (4 more)** — Only 3-1 exists. Need 3-2 through 3-5: "The Snowball Method", "The Avalanche Method", "Negotiating Bills Down", "Your Debt-Free Date"
- [x] 2. **Add Level 4 lessons (6 total)** — "Investing 101" completely missing. Lessons 4-1 through 4-6 per spec
- [x] 3. **Add Level 5 lessons (5 total)** — "Growing Your Wealth" completely missing. Lessons 5-1 through 5-5 per spec
- [x] 4. **Fix Lesson 2-5 premium flag** — Currently `isPremium: true` but Level 2 should be FREE per spec
- [x] 5. **Free tier 2-goal limit** — Spec says free users get only 2 active goals. No enforcement exists. Add check in createGoal + paywall trigger on 3rd goal
- [x] 6. **Goal creation: reminder frequency selector (Step 3)** — Schema has `reminderFrequency` and `reminderDay` but no UI to set them during goal creation
- [x] 7. **Goal creation: celebration screen (Step 4)** — After creating a goal, should show confetti + "Goal created! Start logging" instead of just navigating back
- [x] 8. **Edit goal functionality** — Spec requires editing goal name, target amount, target date, reminder. Only delete exists
- [x] 9. **Dynamic celebratory micro-copy in log-savings** — Spec: Under $10 "Every dollar counts!", $10-50 "Nice save!", $50+ "Wow! Big win!" Currently just shows amount
- [x] 10. **Goal detail: Share progress button** — Spec requires shareable progress card from goal detail
- [x] 11. **Saved moments tracking in state** — `toggleMomentSaved` updates DB but doesn't update in-memory `savedMomentIds` Set. Archive needs "My Saved Tips" section
- [x] 12. **Money moment archive: search functionality** — Spec shows search bar at top of archive
- [x] 13. **Money moment archive: "My Saved Tips" section** — Spec requires saved/bookmarked tips section
- [x] 14. **Social proof numbers on content** — Spec Gap 28: "12,340 mums found this helpful" on moments, "Adopted by 2,100 users" on swaps, lesson completion counts
- [x] 15. **Premium insights/analytics screen** — Spec Gap 13: Monthly savings report with trends, best saving method, swap impact, projections. Accessible from profile or weekly summary
- [x] 16. **Referral mechanism** — Spec Gap 23: "Share MumVest with a friend" with invite link. Both get 1 week Pro free
- [x] 17. **Streak at risk notification** — Spec: 8PM push if no activity today: "Don't lose your 12-day streak!"
- [x] 18. **Level completion celebration + paywall trigger** — After completing Level 2: celebratory screen -> "Ready for the next chapter?" -> paywall

## MEDIUM PRIORITY (Should-have features)

- [x] 19. **Profile: "Member since" date** — Add `createdAt` tracking to user store and display on profile
- [x] 20. **Profile: Lessons completed count** — Show "Lessons Completed: X/26" on profile header
- [x] 21. **Profile: Savings history (monthly)** — Monthly breakdown of savings on profile page
- [x] 22. **Home: "Missed days" Money Moment state** — If user missed yesterday, show "You missed yesterday's tip: [Catch up]"
- [x] 23. **Home: Weekly summary positive framing for "down" case** — Currently shows red arrow. Spec says: "Every dollar counts. You're still ahead of where you started."
- [x] 24. **Challenge failed encouragement** — When challenge is abandoned, show warm message: "This one didn't work out, and that's okay..."
- [x] 25. **All lessons complete state** — Empty state for learn tab when all lessons done: "You've completed every lesson. You're a MumVest graduate!"
- [x] 26. **Custom fonts loading (Nunito/Inter)** — Tailwind config references these but no font assets are loaded
- [x] 27. **Loading/skeleton shimmer states** — Spec Gap 16: Skeleton screens for content loading
- [x] 28. **Goal detail: weekly/monthly savings average** — Spec shows weekly average savings rate on goal cards
- [x] 29. **Onboarding: gradient background on welcome** — Spec says "warm gradient background (soft coral to warm peach)"
- [x] 30. **Weekly savings reminder notification** — Spec: "Time to log your savings!" on user-set day
- [x] 31. **Add 1 more beginner challenge** — Spec requires 4 beginner + 2 intermediate. Currently 3 beginner + 2 intermediate + 1 advanced. Either add 1 beginner or reclassify challenge-005

## NICE TO HAVE (Polish & extras)

- [x] 32. **Export savings data as PDF** — Premium feature per spec
- [x] 33. **Pre-permission notification screen** — Custom screen before iOS permission dialog to boost grant rate
- [x] 34. **Edit savings entry** — Spec Gap 8: Swipe to edit an entry (currently only delete via long-press)
- [x] 35. **About MumVest screen** — In settings, linked from legal section
- [x] 36. **Send feedback option** — In settings
- [x] 37. **Reset progress option** — In settings
- [x] 38. **Delete account option** — In settings
- [x] 39. **Personalization tracking** — Spec Gap 29: Track which moment/swap categories get thumbs up, surface more of what user likes
- [x] 40. **Week 2 re-engagement notifications** — Day 3/7/10/14 milestone notifications
- [x] 41. **Deep link support for shared content** — Spec Gap 25: Shared content opens app to relevant screen
- [x] 42. **Store comparison swaps content** — Spec Gap 1: "Where to Buy What" cards comparing retailers
- [x] 43. **Meal cost calculator in swaps** — Spec Gap 2: Side-by-side meal cost comparisons with prep details
- [x] 44. **Money moment day number display** — Show "Day 12" on moment detail screen
- [x] 45. **Level map: pulsing animation on current lesson** — Spec says current node should pulse
- [x] 46. **Onboarding: "Already have an account? Sign in" link** — On welcome screen (for future account feature)
- [x] 47. **Rebecca welcome video placeholder** — 30-second video slot in onboarding
