
/**
 * Import teams from CSV into MongoDB
 *
 * CSV format:
 *   teamName,email
 *   Alpha Detectives,leader1@gmail.com
 *   Beta Investigators,leader2@gmail.com
 *
 * Usage:
 *   npx tsx scripts/import-teams.ts <path-to-csv>
 *
 * Example:
 *   npx tsx scripts/import-teams.ts ./teams.csv
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Team from "../src/models/Team";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

function parseCSV(filePath: string): Array<{ teamName: string; email: string }> {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Skip header row if present
    const startIndex = lines[0].toLowerCase().includes("teamname") ? 1 : 0;
    const dataLines = lines.slice(startIndex);
    const teams: Array<{ teamName: string; email: string }> = [];

    for (const line of dataLines) {
        // Handle quoted CSV values too
        const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));

        if (parts.length >= 2) {
            const teamName = parts[0];
            const email = parts[1].toLowerCase();

            if (teamName && email) {
                teams.push({ teamName, email });
            }
        }
    }

    return teams;
}

async function importTeams() {
    // Get CSV path from command line args
    const csvPath = process.argv[2];

    if (!csvPath) {
        console.error("❌ Please provide a CSV file path");
        console.error("   Usage: npx tsx scripts/import-teams.ts <path-to-csv>");
        console.error("   Example: npx tsx scripts/import-teams.ts ./teams.csv");
        process.exit(1);
    }

    const resolvedPath = path.resolve(csvPath);

    if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ File not found: ${resolvedPath}`);
        process.exit(1);
    }

    // Parse CSV
    const teams = parseCSV(resolvedPath);

    if (teams.length === 0) {
        console.error("❌ No valid teams found in CSV");
        console.error("   Expected format: teamName,email");
        process.exit(1);
    }

    console.log(`📄 Found ${teams.length} teams in CSV\n`);

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected!\n");

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const { teamName, email } of teams) {
        try {
            // Check if team already exists
            const existing = await Team.findOne({
                $or: [{ teamName }, { leaderEmail: email }],
            });

            if (existing) {
                console.log(`⏭  Skipped "${teamName}" (${email}) — already exists`);
                skipped++;
                continue;
            }

            await Team.create({
                teamName,
                leaderEmail: email,
                members: [],
                completedWorlds: [],
                activeSessionId: null,
                finalSubmitted: false,
            });

            console.log(`✅ Created "${teamName}" → ${email}`);
            created++;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ Error creating "${teamName}": ${errorMessage}`);
            errors++;
        }
    }

    console.log("\n═══════════════════════════════════════");
    console.log("📊 Import Summary");
    console.log("═══════════════════════════════════════");
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭  Skipped: ${skipped}`);
    console.log(`   ❌ Errors:  ${errors}`);
    console.log(`   📋 Total:   ${teams.length}`);
    console.log("═══════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(errors > 0 ? 1 : 0);
}

importTeams().catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
});
