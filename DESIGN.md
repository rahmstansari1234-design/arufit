# Design Brief — Arufit with Group Chats, Reactions & Video Calls

## Tone & Differentiation
Premium minimal social fitness app with Liquid Glass frosted glass design throughout. Dark navy/charcoal backgrounds, white/light grey cards, Inter 400–500 body, Poppins 600–700 display. Soft green accent (#4CAF7D / oklch 0.63 0.12 145) used sparingly on buttons, active reactions, call controls. Translucent overlays with 24px blur on all modals, headers, chat inputs. Smooth spring animations (0.34, 1.56, 0.64, 1 cubic-bezier) on emoji burst reactions, call screen slide-ins, message sends, group chat admin badges. Spacious breathable layouts, zero ornament. Instagram-style social + WhatsApp-style group messaging with admin controls. Video call UI mockable state (no WebRTC codec). All fitness tracking (steps, routines, gym, calories) fully functional.

## Palette (OKLCH) — Arufit Premium Social
| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Soft Green Accent | `0.63 0.12 145` | `0.63 0.12 145` | Buttons, active states, highlights, call controls |
| Reaction Heart | `0.62 0.16 25` | `0.68 0.15 25` | Red emoji reaction accent |
| Reaction Fire | `0.68 0.14 28` | `0.72 0.14 28` | Orange emoji reaction accent |
| Reaction Smiley | `0.76 0.2 60` | `0.8 0.18 60` | Yellow emoji reaction accent |
| Foreground | `0.12 0 240` | `0.98 0 0` | Text, primary content |
| Background | `1 0 0` | `0.08 0 240` | Main bg surface |
| Card | `0.97 0.01 240` | `0.11 0 240` | Secondary surfaces, chat bubbles |
| Muted | `0.92 0.01 240` | `0.18 0 240` | Tertiary, placeholders, dividers |

## Typography
| Tier | Font | Usage |
| --- | --- | --- |
| Display | Poppins 600–700 | Headings, card titles, CTAs, call screen labels |
| Body | Inter 400–500 | Labels, descriptions, chat text, admin badge |
| Mono | JetBrains Mono 400 | Timers, badges, system text, call duration |

## Structural Zones
| Zone | Treatment |
| --- | --- |
| Header/Stories Row | Frosted glass (blur 24px), soft green active ring on avatars |
| Feed Card | White/card bg, minimal shadow, avatar left, content center, like/comment icons right |
| Chat Bubble (User) | Soft green bg, white text, rounded 16px, spring fade-up entrance |
| Chat Bubble (Other) | Card bg, foreground text, rounded 16px, spring fade-up entrance |
| Group Chat Admin Badge | Soft green accent bg, uppercase small text, dashed border, placed next to username |
| Reaction Picker | Frosted glass modal, 6 emoji (❤️ 🔥 😊 😮 😢 😂), hover scale 1.2, active scale 0.8 bounce |
| Emoji Burst | Floats up and fades, 0.5s spring pop then float away, z-index top |
| Call Screen Overlay | Full-screen translucent dark overlay (blur 12px), fade-up entrance 0.4s |
| Call Modal | Frosted glass card, centered avatar with pulse ring, name/status text, button group bottom |
| Call Button (Accept) | Soft green bg, white text, 120ms press scale 0.95, glow shadow |
| Call Button (Decline) | Muted bg, foreground text, border subtle, 120ms press scale 0.95 |
| Bottom Tab Bar | Frosted glass, soft green active icon, no label |
| Button (Primary) | Soft green bg, white text, 120ms press scale 0.95 |
| Button (Secondary) | Card bg, green text, border green |
| Input | Muted bg, foreground text, soft border, frosted glass placeholder |

## Component Patterns
- **Social Feed**: Infinite scroll, card-per-post, avatar → name/time → media/text → like/comment icons, reaction emoji picker on hover
- **Story Bubble**: Circular 64px avatar, unseen = soft green ring 2px, seen = muted ring
- **Group Chat**: Conversation list with admin badge next to group name, participant count, last message preview, unread dot green
- **Chat Bubble**: User bubble right (soft green bg) / other left (card bg), no inline reply threads, emoji reactions below message
- **Emoji Reaction Row**: 6 emoji options (❤️ 🔥 😊 😮 😢 😂), picker in frosted glass modal, hover scale 1.2, active animates emoji-burst-pop (0.5s)
- **Video Call Incoming**: Full-screen overlay, centered avatar with pulsing ring, caller name + status, two buttons below (green Accept / grey Decline)
- **Video Call In-Session**: Placeholder for self/remote video (UI mockable state), bottom control bar with mute/end/speaker icons
- **Daily Routine Card**: Card bg, Poppins title, time muted, checkbox left, ✓ soft green on complete
- **Gym Tracker**: Exercise row, inline sets/reps/weight, rest timer minimal pop-up centered
- **Calorie Ring**: Centered donut chart, soft green fill = eaten, muted fill = remaining, % center
- **Profile**: Cover area muted gradient, avatar centered overlapping 64px, stats row (Posts / Following), grid below

## Motion & Touch Feedback
- Tab switch: 200ms fade via opacity
- Button press: 120ms scale 1 → 0.95, haptic pulse
- Card entrance: 300ms fade-up, soft-pop curve
- Like animation: soft green pulse expand (0 → 12px shadow)
- Reaction emoji: 150ms scale 1.2 on hover, active triggers 0.5s emoji-burst-pop with scale 1.3 → 0.8 and rotate
- Emoji burst: 0.8s float up and fade using CSS variables (--tx, --ty)
- Story view mark: instant, avatar ring fades from green to grey
- Call screen: 0.4s fade-up entrance with semi-transparent dark overlay slide-in
- Call button press: 120ms scale 0.95, haptic feedback
- Message send: 200ms slide-up fade, spring entrance
- Group chat admin badge: minimal glow, no animation
- Scroll: 60fps smooth, no jank

## Constraints & Signature Detail
Minimal shadows (elevation-only, no glow except call buttons). Rounded corners 8–16px on cards, 2rem on call modals. Frosted glass on all overlays, modals, and input surfaces with consistent 24px blur + saturate(1.8–2). Soft green accent density: buttons + call controls + active reactions per screen (not on text, not secondary elements). Clean whitespace rhythm. Zero ornament — every pixel serves function or motion. Instagram familiarity (feed, stories, profiles) meets WhatsApp intimacy (group messaging, presence, reactions). Spring animation cubic-bezier (0.34, 1.56, 0.64, 1) is signature motion curve for all interactive elements.

## Five-Tab Navigation
| Tab | Icon | Purpose | UX Pattern |
| --- | --- | --- | --- |
| **Home** | House | Feed, stories, activity | Infinite scroll, stories top, feed cards with reaction hover |
| **Explore** | Search | Discover, trending, search | Grid, filters (Gym/Food/Progress/Mindset), users |
| **Add** | Plus | Create post/story | Camera/gallery, text overlay, mood tag |
| **Chat** | Message | Direct messages & group chats | Conversation list with group badge, unread dot, chat bubbles with reactions |
| **Profile** | User | Personal profile, settings | Avatar, stats, post grid, edit/logout |

## Arufit Social + Fitness Features
**Social**: Posts (photos + text), stories (24h), profiles (follow/unfollow), direct messaging + group chats (admin controls, participant list, leave group). **Post Reactions**: 6 emoji (❤️ 🔥 😊 😮 😢 😂) with animated burst effect, count display per reaction. **Video Calls**: Incoming call screen (full overlay, accept/decline), in-session mockable state (UI only, no WebRTC). **Group Chat**: Create group, add members, admin promote/demote, leave group, mute notifications. **Daily Routine**: Greeting card, checklist with progress %, Flex Day save. **Gym Tracker**: Weekly plan (custom day labels), exercise rows, calorie goals. **Calorie Tracking**: Donut ring, food/burn diary, water tracker. **Step Tracking**: Auto motion sensor, manual entry fallback. **AI Assistant**: Chat with personalized daily recommendations.
