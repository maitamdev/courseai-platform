#!/bin/bash
# Script to fix all text colors to white/light gray in all components

# Replace text-gray-600 with text-gray-300
find src/components -name "*.tsx" -type f -exec sed -i 's/text-gray-600/text-gray-300/g' {} +

# Replace text-gray-700 with text-gray-300
find src/components -name "*.tsx" -type f -exec sed -i 's/text-gray-700/text-gray-300/g' {} +

# Replace text-gray-800 with text-white
find src/components -name "*.tsx" -type f -exec sed -i 's/text-gray-800/text-white/g' {} +

# Replace text-gray-900 with text-white
find src/components -name "*.tsx" -type f -exec sed -i 's/text-gray-900/text-white/g' {} +

echo "✅ All text colors fixed!"
