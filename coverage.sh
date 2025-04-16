#!/bin/bash

# Step 1: Run the command and store output
coverage_output=$(deno coverage)

# Step 2: Extract the "All files" line
all_files_line=$(echo "$coverage_output" | grep "All files")

# Step 3: Extract the two percentage numbers (branch and line)
read branch_percent line_percent <<< $(echo "$all_files_line" | grep -oE '[0-9]+\.[0-9]+')

# Debug (optional)
echo "Branch %: $branch_percent"
echo "Line %: $line_percent"

# Step 4: Calculate average using bc
average=$(echo "scale=2; ($branch_percent + $line_percent) / 2" | bc)

echo "Average: $average"

# Step 5: Exit 0 only if average > 90
is_greater=$(echo "$average > 90" | bc)

if [ "$is_greater" -eq 1 ]; then
  echo "✅ Coverage is sufficient."
  exit 0
else
  echo "❌ Coverage is insufficient."
  exit 1
fi
