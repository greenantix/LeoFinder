#!/usr/bin/env bash
# motivation.sh – barks at Claude in VS Code every 30 minutes

INTERVAL=1800  # 30 minutes

MESSAGES=(
  "🐾 Let’s get after it—Leo's ready to sniff out your next home base. Let's continue!"
  "🚀 30 minutes down, momentum's up. Stay focused. Continue building!"
  "🛠️ Each commit is a brick in your future house. Keep stacking. Continue!"
  "💡 Don’t overthink—Claude’s waiting. Continue with confidence!"
  "🏚️ No house finds itself. Keep the hunt alive. Continue!"
  "🐕 Leo believes in you. You better not let that dog down. Continue!"
  "🧠 This AI won’t tune itself. You’re the brain. Continue!"
  "🌤️ Breakthroughs don’t schedule themselves. Keep going. Continue!"
  "🔥 You’ve already built more than most ever will. Continue!"
  "📦 One more function. One less excuse. Continue!"
  "🔄 Refactor. Ship. Repeat. You know the drill. Continue!"
  "📬 The inbox won’t write itself—Claude needs orders. Continue!"
  "📈 Every match scored is another life changed. Keep building. Continue!"
  "🔧 Bugs? Good. Debugging is how we ascend. Continue!"
  "🐾 Leo’s tail is wagging at 88% match score. Don’t stop now. Continue!"
  "🪞 Reflect, then redirect. You’ve got the map. Continue!"
  "🏁 This is the final sprint. Bring it home, dev. Continue!"
)

# Find the first VS Code window
CODE_WIN=$(xdotool search --class "code" | head -n 1)
if [[ -z "$CODE_WIN" ]]; then
  echo "❌ VS Code window not found. Make sure it’s running."
  exit 1
fi

i=0
while true; do
  MSG="${MESSAGES[$i]}"
  (( i = (i + 1) % ${#MESSAGES[@]} ))

  # Focus VS Code and send message to terminal
  if xdotool windowactivate --sync "$CODE_WIN" 2>/dev/null; then
    sleep 0.3
    # Send message directly to terminal (assuming terminal is active)
    xdotool type --delay 50 "$MSG"
    xdotool key Return
    echo "📨 Sent: $MSG"
  else
    echo "⚠️  Could not activate VS Code window"
  fi

  sleep "$INTERVAL"
done
