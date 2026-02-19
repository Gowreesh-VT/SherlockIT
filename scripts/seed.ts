/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seed script for SherlockIT 2.0
 *
 * Run: npx tsx scripts/seed.ts
 *
 * Populates the database with:
 * - 5 sample worlds (first one unlocked, rest locked)
 * - Event control document (final answer closed by default)
 * - 2 sample announcements
 *
 * NOTE: Teams are imported separately via import-teams.ts with a CSV file.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

// Inline schemas
const WorldSchema = new mongoose.Schema({
    title: { type: String, required: true },
    story: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, required: true, unique: true },
    isLocked: { type: Boolean, default: true },
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
    message: { type: String, required: true },
}, { timestamps: true });

const EventControlSchema = new mongoose.Schema({
    finalAnswerOpen: { type: Boolean, default: false },
    finalAnswerStartTime: { type: Date, default: null },
}, { timestamps: true });

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    const World = mongoose.model("World", WorldSchema);
    const Announcement = mongoose.model("Announcement", AnnouncementSchema);
    const EventControl = mongoose.model("EventControl", EventControlSchema);

    // Clear existing data (NOT teams — those are imported separately)
    console.log("🗑  Clearing worlds, announcements, and event control...");
    await World.deleteMany({});
    await Announcement.deleteMany({});
    await EventControl.deleteMany({});

    // Seed Worlds
    console.log("\n🌍 Creating worlds...");
    const worlds = await World.insertMany([
        {
            title: "The Abandoned Library",
            story: "You find yourself in a dusty old library. The shelves tower above you, filled with ancient tomes. A single book lies open on a desk, its pages yellowed with age. The text seems to shimmer in the dim candlelight. As you lean closer, you notice a pattern in the words — a cipher hidden within the prose.\n\nThe last librarian was known for his love of puzzles. Before he vanished, he left behind clues scattered across the pages. The answer to his riddle would reveal the location of the next world.",
            question: "What is the name of the famous cipher that substitutes each letter with a letter a fixed number of positions down the alphabet?",
            answer: "Caesar cipher",
            order: 1,
            isLocked: false,
        },
        {
            title: "The Clockwork Mansion",
            story: "The heavy iron door creaks open to reveal a mansion where everything is mechanical. Gears turn on the walls, pendulums swing from the ceiling, and the floor vibrates with the pulse of hidden machinery.\n\nIn the center of the main hall sits a grandfather clock, its hands frozen at midnight. Beneath it, an inscription reads: 'Time stops for no one, but numbers reveal all.' A series of numbers is etched into the clock face: 1, 1, 2, 3, 5, 8, 13...",
            question: "What is the name of this famous number sequence where each number is the sum of the two preceding ones?",
            answer: "Fibonacci",
            order: 2,
            isLocked: true,
        },
        {
            title: "The Shadow Garden",
            story: "Beyond the mansion lies a garden shrouded in perpetual twilight. Strange plants grow here — some luminescent, others dark as night. In the center of the garden stands a sundial, but it casts no shadow.\n\nAround the sundial, four stone tablets are arranged, each bearing a symbol: a key, a crown, a serpent, and a chalice. Below them, carved in stone: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.'",
            question: "What am I? (the answer to the riddle on the stone tablets)",
            answer: "Echo",
            order: 3,
            isLocked: true,
        },
        {
            title: "The Frozen Laboratory",
            story: "Temperature drops as you descend into an underground laboratory. Everything is coated in frost — beakers, test tubes, and strange chemical formulas written on a whiteboard.\n\nOne formula stands out, circled in red: H₂O. Below it, a note reads: 'At what temperature does my solid form become liquid? Answer in Celsius, and the truth shall be revealed.'",
            question: "At what temperature (in °C) does ice melt into water?",
            answer: "0",
            order: 4,
            isLocked: true,
        },
        {
            title: "The Final Vault",
            story: "You've reached the final vault. The door is massive, reinforced with steel and guarded by a digital lock. On the screen, a message flickers:\n\n'In computing, I am the fundamental unit of data. I can be either 0 or 1. What am I called?'\n\nThe vault holds the ultimate truth — the answer to the mystery. But first, you must prove your knowledge one last time.",
            question: "What is the fundamental unit of data in computing that can be either 0 or 1?",
            answer: "Bit",
            order: 5,
            isLocked: true,
        },
    ]);
    console.log(`   Created ${worlds.length} worlds`);

    // Seed Announcements
    console.log("\n📢 Creating announcements...");
    await Announcement.insertMany([
        { message: "Welcome to SherlockIT 2.0! 🕵️ The mystery begins now. Good luck, detectives!" },
        { message: "Hint: Pay close attention to the storylines. The answers are closer than you think! 🔍" },
    ]);
    console.log("   Created 2 announcements");

    // Seed Event Control
    console.log("\n⚙️  Creating event control...");
    await EventControl.create({
        finalAnswerOpen: false,
        finalAnswerStartTime: null,
    });
    console.log("   Event control created (final answer: CLOSED)");

    console.log("\n═══════════════════════════════════════");
    console.log("✅ Seed complete!");
    console.log("═══════════════════════════════════════");
    console.log("\n📋 Next Steps:");
    console.log("   1. Import teams: npx tsx scripts/import-teams.ts ./teams.csv");
    console.log("   2. Run app: npm run dev");
    console.log("   3. First world is UNLOCKED, rest are LOCKED");
    console.log("   4. Final answer is CLOSED (toggle in DB or via admin panel)\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
