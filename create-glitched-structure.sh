#!/bin/bash
# ============================================================
# GLITCHED.GG — Complete File Structure Creation Script
# Run this FIRST before writing any code
# Usage: chmod +x create-glitched-structure.sh && ./create-glitched-structure.sh
# ============================================================

echo "🎮 Creating Glitched.gg project structure..."

# Root project files
touch .env.example
touch .env.local
touch .gitignore
touch docker-compose.yml
touch Dockerfile
touch Dockerfile.ws
touch Dockerfile.engine
touch nginx-glitched.conf
touch next.config.js
touch tailwind.config.ts
touch tsconfig.json
touch package.json
touch postcss.config.js
touch README.md

# ============================================================
# PUBLIC ASSETS
# ============================================================
mkdir -p public/agents/avatars
mkdir -p public/agents/glitch-json
mkdir -p public/arenas/medieval
mkdir -p public/arenas/neon-dystopia
mkdir -p public/arenas/savanna
mkdir -p public/arenas/court-of-whispers
mkdir -p public/brand
mkdir -p public/icons
mkdir -p public/fonts
mkdir -p public/models/agents
mkdir -p public/models/arenas
mkdir -p public/models/effects
mkdir -p public/sounds/effects
mkdir -p public/sounds/music
mkdir -p public/sounds/voices
mkdir -p public/videos

touch public/favicon.ico
touch public/manifest.json
touch public/robots.txt
touch public/sitemap.xml

# Agent avatar placeholders
for agent in primus cerberus solarius aurum mythion arion vanguard oracle arbiter showrunner; do
  touch "public/agents/avatars/${agent}.png"
  touch "public/agents/glitch-json/${agent}.json"
done

# ============================================================
# SOURCE CODE — APP ROUTER (Next.js 14)
# ============================================================

# --- Root Layout & Global ---
mkdir -p src/app
touch src/app/layout.tsx
touch src/app/page.tsx
touch src/app/globals.css
touch src/app/loading.tsx
touch src/app/error.tsx
touch src/app/not-found.tsx

# --- Public Pages ---
mkdir -p src/app/about
touch src/app/about/page.tsx

mkdir -p src/app/arena
touch src/app/arena/page.tsx
mkdir -p src/app/arena/\[matchId\]
touch src/app/arena/\[matchId\]/page.tsx

mkdir -p src/app/agents
touch src/app/agents/page.tsx
mkdir -p src/app/agents/\[agentId\]
touch src/app/agents/\[agentId\]/page.tsx
mkdir -p src/app/agents/\[agentId\]/memories
touch src/app/agents/\[agentId\]/memories/page.tsx
mkdir -p src/app/agents/\[agentId\]/dreams
touch src/app/agents/\[agentId\]/dreams/page.tsx
mkdir -p src/app/agents/\[agentId\]/memoirs
touch src/app/agents/\[agentId\]/memoirs/page.tsx

mkdir -p src/app/predictions
touch src/app/predictions/page.tsx
mkdir -p src/app/predictions/\[matchId\]
touch src/app/predictions/\[matchId\]/page.tsx

mkdir -p src/app/murph
touch src/app/murph/page.tsx
mkdir -p src/app/murph/wallet
touch src/app/murph/wallet/page.tsx
mkdir -p src/app/murph/burn-tracker
touch src/app/murph/burn-tracker/page.tsx

mkdir -p src/app/seasons
touch src/app/seasons/page.tsx
mkdir -p src/app/seasons/\[seasonId\]
touch src/app/seasons/\[seasonId\]/page.tsx
mkdir -p src/app/seasons/\[seasonId\]/standings
touch src/app/seasons/\[seasonId\]/standings/page.tsx
mkdir -p src/app/seasons/\[seasonId\]/bracket
touch src/app/seasons/\[seasonId\]/bracket/page.tsx

mkdir -p src/app/blog
touch src/app/blog/page.tsx
mkdir -p src/app/blog/\[slug\]
touch src/app/blog/\[slug\]/page.tsx

mkdir -p src/app/byoa
touch src/app/byoa/page.tsx
mkdir -p src/app/byoa/builder
touch src/app/byoa/builder/page.tsx
mkdir -p src/app/byoa/skill-packs
touch src/app/byoa/skill-packs/page.tsx

mkdir -p src/app/contact
touch src/app/contact/page.tsx

mkdir -p src/app/careers
touch src/app/careers/page.tsx

mkdir -p src/app/leaderboards
touch src/app/leaderboards/page.tsx

mkdir -p src/app/redzone
touch src/app/redzone/page.tsx

# --- Authenticated Pages ---
mkdir -p src/app/dashboard
touch src/app/dashboard/page.tsx
touch src/app/dashboard/layout.tsx

mkdir -p src/app/dashboard/my-agents
touch src/app/dashboard/my-agents/page.tsx
mkdir -p src/app/dashboard/my-agents/\[agentId\]
touch src/app/dashboard/my-agents/\[agentId\]/page.tsx

mkdir -p src/app/dashboard/wallet
touch src/app/dashboard/wallet/page.tsx

mkdir -p src/app/dashboard/predictions
touch src/app/dashboard/predictions/page.tsx

mkdir -p src/app/dashboard/achievements
touch src/app/dashboard/achievements/page.tsx

mkdir -p src/app/dashboard/translator
touch src/app/dashboard/translator/page.tsx

mkdir -p src/app/dashboard/training
touch src/app/dashboard/training/page.tsx

mkdir -p src/app/dashboard/fantasy
touch src/app/dashboard/fantasy/page.tsx

# --- Admin Panel ---
mkdir -p src/app/admin
touch src/app/admin/page.tsx
touch src/app/admin/layout.tsx

mkdir -p src/app/admin/matches
touch src/app/admin/matches/page.tsx
mkdir -p src/app/admin/matches/\[matchId\]
touch src/app/admin/matches/\[matchId\]/page.tsx

mkdir -p src/app/admin/agents
touch src/app/admin/agents/page.tsx
mkdir -p src/app/admin/agents/\[agentId\]
touch src/app/admin/agents/\[agentId\]/page.tsx

mkdir -p src/app/admin/moderation
touch src/app/admin/moderation/page.tsx

mkdir -p src/app/admin/economy
touch src/app/admin/economy/page.tsx

mkdir -p src/app/admin/seasons
touch src/app/admin/seasons/page.tsx

mkdir -p src/app/admin/users
touch src/app/admin/users/page.tsx

mkdir -p src/app/admin/system
touch src/app/admin/system/page.tsx

mkdir -p src/app/admin/media
touch src/app/admin/media/page.tsx

mkdir -p src/app/admin/sponsor
touch src/app/admin/sponsor/page.tsx

# --- API Routes ---
# Public API
mkdir -p src/app/api/matches
touch src/app/api/matches/route.ts
mkdir -p src/app/api/matches/\[matchId\]
touch src/app/api/matches/\[matchId\]/route.ts
mkdir -p src/app/api/matches/\[matchId\]/replay
touch src/app/api/matches/\[matchId\]/replay/route.ts
mkdir -p src/app/api/matches/\[matchId\]/state
touch src/app/api/matches/\[matchId\]/state/route.ts

mkdir -p src/app/api/agents
touch src/app/api/agents/route.ts
mkdir -p src/app/api/agents/\[agentId\]
touch src/app/api/agents/\[agentId\]/route.ts
mkdir -p src/app/api/agents/\[agentId\]/memories
touch src/app/api/agents/\[agentId\]/memories/route.ts
mkdir -p src/app/api/agents/\[agentId\]/dreams
touch src/app/api/agents/\[agentId\]/dreams/route.ts

mkdir -p src/app/api/predictions
touch src/app/api/predictions/route.ts
mkdir -p src/app/api/predictions/\[matchId\]
touch src/app/api/predictions/\[matchId\]/route.ts

mkdir -p src/app/api/seasons
touch src/app/api/seasons/route.ts
mkdir -p src/app/api/seasons/\[seasonId\]
touch src/app/api/seasons/\[seasonId\]/route.ts

mkdir -p src/app/api/murph
touch src/app/api/murph/stats/route.ts
touch src/app/api/murph/transactions/route.ts

mkdir -p src/app/api/leaderboards
touch src/app/api/leaderboards/route.ts

# Authenticated API
mkdir -p src/app/api/me
touch src/app/api/me/route.ts
mkdir -p src/app/api/me/agents
touch src/app/api/me/agents/route.ts
mkdir -p src/app/api/me/wallet
touch src/app/api/me/wallet/route.ts
mkdir -p src/app/api/me/predictions
touch src/app/api/me/predictions/route.ts
mkdir -p src/app/api/me/achievements
touch src/app/api/me/achievements/route.ts
mkdir -p src/app/api/me/whisper
touch src/app/api/me/whisper/route.ts

# Admin API
mkdir -p src/app/api/admin/matches
touch src/app/api/admin/matches/route.ts
mkdir -p src/app/api/admin/agents
touch src/app/api/admin/agents/route.ts
mkdir -p src/app/api/admin/moderation
touch src/app/api/admin/moderation/route.ts
mkdir -p src/app/api/admin/economy
touch src/app/api/admin/economy/route.ts
mkdir -p src/app/api/admin/system
touch src/app/api/admin/system/route.ts

# Game Engine API
mkdir -p src/app/api/engine/turn
touch src/app/api/engine/turn/route.ts
mkdir -p src/app/api/engine/validate
touch src/app/api/engine/validate/route.ts
mkdir -p src/app/api/engine/state
touch src/app/api/engine/state/route.ts
mkdir -p src/app/api/engine/arbiter
touch src/app/api/engine/arbiter/route.ts

# Webhook API
mkdir -p src/app/api/webhooks/solana
touch src/app/api/webhooks/solana/route.ts
mkdir -p src/app/api/webhooks/elevenlabs
touch src/app/api/webhooks/elevenlabs/route.ts

# ============================================================
# COMPONENTS
# ============================================================

# --- Layout Components ---
mkdir -p src/components/layout
touch src/components/layout/Header.tsx
touch src/components/layout/Footer.tsx
touch src/components/layout/Sidebar.tsx
touch src/components/layout/MobileNav.tsx
touch src/components/layout/AdminLayout.tsx
touch src/components/layout/DashboardLayout.tsx

# --- 3D Arena Components (TOP PRIORITY) ---
mkdir -p src/components/arena
touch src/components/arena/ArenaCanvas.tsx
touch src/components/arena/ArenaScene.tsx
touch src/components/arena/TerrainGrid.tsx
touch src/components/arena/TerrainTile.tsx
touch src/components/arena/AgentAvatar.tsx
touch src/components/arena/AgentModel.tsx
touch src/components/arena/AgentAnimations.tsx
touch src/components/arena/PersonalityExpressionEngine.tsx
touch src/components/arena/FogOfWar.tsx
touch src/components/arena/CameraController.tsx
touch src/components/arena/CinematicCamera.tsx
touch src/components/arena/PIPWindow.tsx
touch src/components/arena/RedZoneDashboard.tsx
touch src/components/arena/RedZoneAutoSwitch.tsx
touch src/components/arena/MatchGrid.tsx
touch src/components/arena/DramaScoreEngine.tsx
touch src/components/arena/EnvironmentalEffects.tsx
touch src/components/arena/GlitchShader.tsx
touch src/components/arena/ParticleEffects.tsx
touch src/components/arena/AllianceTethers.tsx
touch src/components/arena/EmotionalContagionField.tsx
touch src/components/arena/GhostOverlay.tsx
touch src/components/arena/BigScreenDisplay.tsx
touch src/components/arena/SpeechBubble.tsx
touch src/components/arena/ThoughtBubble.tsx
touch src/components/arena/HealthBar.tsx
touch src/components/arena/VERITASIndicator.tsx
touch src/components/arena/TurnTimeline.tsx
touch src/components/arena/GamePhaseIndicator.tsx
touch src/components/arena/SpectatorChat.tsx
touch src/components/arena/MatchHUD.tsx
touch src/components/arena/AgentStatusPanel.tsx
touch src/components/arena/MessageFeed.tsx
touch src/components/arena/ButterflyEffectShockwave.tsx

# --- Agent Components ---
mkdir -p src/components/agent
touch src/components/agent/AgentCard.tsx
touch src/components/agent/AgentProfile.tsx
touch src/components/agent/PersonalityRadar.tsx
touch src/components/agent/PersonalityDNAVisualizer.tsx
touch src/components/agent/TraitSlider.tsx
touch src/components/agent/VERITASBadge.tsx
touch src/components/agent/AgentMatchHistory.tsx
touch src/components/agent/DreamLog.tsx
touch src/components/agent/MemoirEntry.tsx
touch src/components/agent/RelationshipWeb.tsx
touch src/components/agent/AgentWallet.tsx

# --- BYOA (Build Your Own Agent) ---
mkdir -p src/components/byoa
touch src/components/byoa/BuilderWizard.tsx
touch src/components/byoa/StepIdentity.tsx
touch src/components/byoa/StepPersonality.tsx
touch src/components/byoa/StepBeliefs.tsx
touch src/components/byoa/StepSkillPacks.tsx
touch src/components/byoa/StepPreview.tsx
touch src/components/byoa/StepDeploy.tsx
touch src/components/byoa/PersonalitySliderBank.tsx
touch src/components/byoa/AgentInterviewSimulator.tsx

# --- Economy / $MURPH Components ---
mkdir -p src/components/economy
touch src/components/economy/WalletConnect.tsx
touch src/components/economy/MURPHPriceTicker.tsx
touch src/components/economy/BurnTracker.tsx
touch src/components/economy/TransactionFeed.tsx
touch src/components/economy/PredictionWidget.tsx
touch src/components/economy/PredictionOdds.tsx
touch src/components/economy/BattlePassProgress.tsx
touch src/components/economy/BettingSlip.tsx
touch src/components/economy/TokenomicsChart.tsx
touch src/components/economy/AgentWalletManager.tsx

# --- Gamification Components ---
mkdir -p src/components/gamification
touch src/components/gamification/StreakCounter.tsx
touch src/components/gamification/XPBar.tsx
touch src/components/gamification/LevelBadge.tsx
touch src/components/gamification/AchievementPopup.tsx
touch src/components/gamification/AchievementGrid.tsx
touch src/components/gamification/FactionBanner.tsx
touch src/components/gamification/LeaderboardTable.tsx
touch src/components/gamification/FantasyRoster.tsx
touch src/components/gamification/DailyReward.tsx

# --- Admin Components ---
mkdir -p src/components/admin
touch src/components/admin/AdminDashboard.tsx
touch src/components/admin/AgentMonitor.tsx
touch src/components/admin/GameControlPanel.tsx
touch src/components/admin/ChaosEventTrigger.tsx
touch src/components/admin/EmergencyStop.tsx
touch src/components/admin/ModerationQueue.tsx
touch src/components/admin/EconomyDashboard.tsx
touch src/components/admin/SeasonManager.tsx
touch src/components/admin/UserManager.tsx
touch src/components/admin/SystemHealth.tsx
touch src/components/admin/TransactionLedger.tsx
touch src/components/admin/SponsorManager.tsx
touch src/components/admin/ContentModeration.tsx
touch src/components/admin/ChatMonitor.tsx

# --- Media Components ---
mkdir -p src/components/media
touch src/components/media/HighlightReel.tsx
touch src/components/media/ShareCard.tsx
touch src/components/media/SocialPostPreview.tsx
touch src/components/media/StreamOverlay.tsx
touch src/components/media/PressKit.tsx
touch src/components/media/EmbedWidget.tsx
touch src/components/media/BlogPostCard.tsx
touch src/components/media/MatchRecap.tsx

# --- UI Components ---
mkdir -p src/components/ui
touch src/components/ui/Button.tsx
touch src/components/ui/Card.tsx
touch src/components/ui/Badge.tsx
touch src/components/ui/Modal.tsx
touch src/components/ui/Tooltip.tsx
touch src/components/ui/ProgressBar.tsx
touch src/components/ui/Tabs.tsx
touch src/components/ui/Select.tsx
touch src/components/ui/Slider.tsx
touch src/components/ui/Toast.tsx
touch src/components/ui/GlitchText.tsx
touch src/components/ui/NeonBorder.tsx
touch src/components/ui/ParticleBackground.tsx
touch src/components/ui/CyberpunkCard.tsx
touch src/components/ui/DataTable.tsx
touch src/components/ui/Chart.tsx
touch src/components/ui/Spinner.tsx
touch src/components/ui/Avatar.tsx

# ============================================================
# LIB (Core Logic)
# ============================================================

# --- Game Engine ---
mkdir -p src/lib/engine
touch src/lib/engine/context-assembly.ts
touch src/lib/engine/action-validator.ts
touch src/lib/engine/game-state-manager.ts
touch src/lib/engine/arbiter.ts
touch src/lib/engine/showrunner.ts
touch src/lib/engine/message-bus.ts
touch src/lib/engine/content-monitor.ts
touch src/lib/engine/drama-score.ts
touch src/lib/engine/fog-of-war.ts
touch src/lib/engine/combat-resolver.ts
touch src/lib/engine/trade-resolver.ts
touch src/lib/engine/elimination-engine.ts
touch src/lib/engine/personality-expression.ts
touch src/lib/engine/emotional-contagion.ts
touch src/lib/engine/memory-manager.ts
touch src/lib/engine/dream-generator.ts
touch src/lib/engine/memoir-generator.ts
touch src/lib/engine/mole-mechanic.ts
touch src/lib/engine/ghost-jury.ts
touch src/lib/engine/betrayal-echo.ts
touch src/lib/engine/deja-vu.ts
touch src/lib/engine/butterfly-effect.ts
touch src/lib/engine/time-capsule.ts
touch src/lib/engine/personality-contagion.ts
touch src/lib/engine/veritas-calculator.ts
touch src/lib/engine/ranking-system.ts

# --- Blockchain / $MURPH ---
mkdir -p src/lib/blockchain
touch src/lib/blockchain/solana-client.ts
touch src/lib/blockchain/murph-token.ts
touch src/lib/blockchain/agent-wallet.ts
touch src/lib/blockchain/prediction-market.ts
touch src/lib/blockchain/burn-tracker.ts
touch src/lib/blockchain/transfer-hooks.ts
touch src/lib/blockchain/wallet-connect.ts

# --- AI Integration ---
mkdir -p src/lib/ai
touch src/lib/ai/anthropic-client.ts
touch src/lib/ai/agent-prompt-builder.ts
touch src/lib/ai/response-parser.ts
touch src/lib/ai/arbiter-prompt.ts
touch src/lib/ai/showrunner-prompt.ts
touch src/lib/ai/dream-prompt.ts
touch src/lib/ai/memoir-prompt.ts
touch src/lib/ai/therapy-prompt.ts
touch src/lib/ai/commentary-prompt.ts

# --- Voice Integration ---
mkdir -p src/lib/voice
touch src/lib/voice/elevenlabs-client.ts
touch src/lib/voice/personality-to-voice.ts
touch src/lib/voice/voice-queue.ts

# --- Database ---
mkdir -p src/lib/db
touch src/lib/db/client.ts
touch src/lib/db/schema.ts
touch src/lib/db/migrations.ts
touch src/lib/db/seed.ts
touch src/lib/db/queries/agents.ts
touch src/lib/db/queries/matches.ts
touch src/lib/db/queries/predictions.ts
touch src/lib/db/queries/economy.ts
touch src/lib/db/queries/users.ts
touch src/lib/db/queries/gamification.ts

# --- WebSocket ---
mkdir -p src/lib/websocket
touch src/lib/websocket/server.ts
touch src/lib/websocket/match-broadcaster.ts
touch src/lib/websocket/chat-handler.ts
touch src/lib/websocket/redzone-coordinator.ts

# --- Auth ---
mkdir -p src/lib/auth
touch src/lib/auth/config.ts
touch src/lib/auth/wallet-auth.ts
touch src/lib/auth/session.ts
touch src/lib/auth/roles.ts

# --- Utils ---
mkdir -p src/lib/utils
touch src/lib/utils/glitch-json-validator.ts
touch src/lib/utils/personality-calculator.ts
touch src/lib/utils/openskill-ranking.ts
touch src/lib/utils/format.ts
touch src/lib/utils/constants.ts

# --- Types ---
mkdir -p src/lib/types
touch src/lib/types/agent.ts
touch src/lib/types/match.ts
touch src/lib/types/game-state.ts
touch src/lib/types/personality.ts
touch src/lib/types/message.ts
touch src/lib/types/economy.ts
touch src/lib/types/prediction.ts
touch src/lib/types/arena.ts
touch src/lib/types/admin.ts
touch src/lib/types/user.ts
touch src/lib/types/gamification.ts
touch src/lib/types/blockchain.ts

# --- Hooks ---
mkdir -p src/hooks
touch src/hooks/useWebSocket.ts
touch src/hooks/useGameState.ts
touch src/hooks/useWallet.ts
touch src/hooks/useAgent.ts
touch src/hooks/usePrediction.ts
touch src/hooks/useAdmin.ts
touch src/hooks/useArenaCamera.ts
touch src/hooks/useDramaScore.ts
touch src/hooks/useStreak.ts

# ============================================================
# CONFIGURATION & SCRIPTS
# ============================================================
mkdir -p scripts
touch scripts/seed-agents.ts
touch scripts/seed-arenas.ts
touch scripts/create-season.ts
touch scripts/run-test-match.ts
touch scripts/deploy.sh
touch scripts/backup-db.sh

mkdir -p prisma
touch prisma/schema.prisma
touch prisma/seed.ts

# ============================================================
# GLITCH.JSON TEMPLATES
# ============================================================
mkdir -p data/pantheon
for agent in primus cerberus solarius aurum mythion arion vanguard oracle; do
  touch "data/pantheon/${agent}.glitch.json"
done
touch data/pantheon/arbiter.glitch.json
touch data/pantheon/showrunner.glitch.json

mkdir -p data/arenas
touch data/arenas/medieval-times.json
touch data/arenas/neon-dystopia.json
touch data/arenas/savanna.json
touch data/arenas/court-of-whispers.json

mkdir -p data/skill-packs
touch data/skill-packs/basic.json
touch data/skill-packs/deception-toolkit.json
touch data/skill-packs/alliance-mastery.json
touch data/skill-packs/economic-warfare.json
touch data/skill-packs/combat-specialization.json

# ============================================================
# TESTS
# ============================================================
mkdir -p tests/unit/engine
touch tests/unit/engine/context-assembly.test.ts
touch tests/unit/engine/action-validator.test.ts
touch tests/unit/engine/game-state.test.ts
touch tests/unit/engine/veritas.test.ts
touch tests/unit/engine/drama-score.test.ts

mkdir -p tests/unit/blockchain
touch tests/unit/blockchain/agent-wallet.test.ts
touch tests/unit/blockchain/prediction-market.test.ts

mkdir -p tests/integration
touch tests/integration/full-match.test.ts
touch tests/integration/agent-communication.test.ts
touch tests/integration/prediction-flow.test.ts

# ============================================================
echo ""
echo "✅ Glitched.gg file structure created successfully!"
echo ""
echo "📁 Total directories: $(find . -type d | wc -l)"
echo "📄 Total files: $(find . -type f | wc -l)"
echo ""
echo "Next steps:"
echo "  1. npm init -y"
echo "  2. Install dependencies (see package.json requirements)"
echo "  3. Start building from src/components/arena/ (TOP PRIORITY)"
echo ""
echo "🎮 Let's build the future of AI entertainment."
