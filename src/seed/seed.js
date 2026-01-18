import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

import User from "../models/user.model.js";
import Location from "../models/location.model.js";
import Event from "../models/event.model.js";

// Resolver __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 FORÇAR carregamento do .env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// DEBUG (não remover até funcionar)
console.log("ENV FILE PATH:", path.resolve(__dirname, "../../.env"));
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// HARD FAIL se não existir
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI não carregado do .env");
  process.exit(1);
}

// Conectar ao Mongo
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");


// =======================
// RESET DATABASE (DEV ONLY)
// =======================
await Promise.all([
  User.deleteMany(),
  Location.deleteMany(),
  Event.deleteMany(),
]);

console.log("🧹 Database cleaned");

// =======================
// USERS
// =======================

const hashedPassword = await bcrypt.hash("password123", 10);

const users = await User.insertMany([
  {
    name: "Gabriel Ferreira",
    email: "admin@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "ADMIN",
  },
  {
    name: "João Martins",
    email: "joao@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "ORGANIZER",
  },
  {
    name: "Ana Ribeiro",
    email: "ana@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "ORGANIZER",
  },
  {
    name: "Miguel Santos",
    email: "miguel@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "ORGANIZER",
  },
  {
    name: "Rita Costa",
    email: "rita@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "PARTICIPANT",
  },
  {
    name: "Pedro Silva",
    email: "pedro@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "PARTICIPANT",
  },
  {
    name: "Carla Lopes",
    email: "carla@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "PARTICIPANT",
  },
  {
    name: "Tiago Moreira",
    email: "tiago@maiseventos.pt",
    passwordHash: hashedPassword,
    role: "PARTICIPANT",
  },
]);

console.log("👤 Users created");

// =======================
// LOCATIONS
// =======================
const locations = await Location.insertMany([
  {
    name: "Cowork Porto",
    address: "Rua das Flores 123",
    city: "Porto",
    latitude: 41.1496,
    longitude: -8.6109,
    source: "MANUAL",
  },
  {
    name: "Biblioteca Municipal",
    address: "Av. Central",
    city: "Braga",
    latitude: 41.5454,
    longitude: -8.4265,
    source: "MANUAL",
  },
  {
    name: "Centro Cultural Belém",
    address: "Praça do Império",
    city: "Lisboa",
    latitude: 38.6977,
    longitude: -9.2066,
    source: "MANUAL",
  },
  {
    name: "Parque Verde",
    address: "Zona Ribeirinha",
    city: "Coimbra",
    latitude: 40.2111,
    longitude: -8.4291,
    source: "MANUAL",
  },
  {
    name: "Associação Juvenil",
    address: "Rua da Juventude",
    city: "Aveiro",
    latitude: 40.6405,
    longitude: -8.6538,
    source: "MANUAL",
  },
  {
    name: "Auditório Municipal",
    address: "Av. da Liberdade",
    city: "Faro",
    latitude: 37.0194,
    longitude: -7.9304,
    source: "MANUAL",
  },
]);

console.log("📍 Locations created");

// =======================
// EVENTS
// =======================
const events = [
  {
    title: "Meetup Devs JS",
    description: "Encontro informal para developers JavaScript.",
    date: new Date("2026-03-24"),
    time: "18:00",
    capacity: 40,
    status: "OPEN",
    organizer: users[1]._id,
    participants: [users[4]._id, users[5]._id],
    location: locations[0]._id,
  },
  {
    title: "Workshop React",
    description: "Introdução prática ao React.",
    date: new Date("2026-04-02"),
    time: "14:30",
    capacity: 25,
    status: "OPEN",
    organizer: users[2]._id,
    participants: [users[4]._id, users[5]._id, users[6]._id],
    location: locations[1]._id,
  },
  {
    title: "Torneio FIFA Solidário",
    description: "Torneio solidário com angariação de fundos.",
    date: new Date("2026-04-10"),
    time: "15:00",
    capacity: 16,
    status: "OPEN",
    organizer: users[3]._id,
    participants: [users[6]._id],
    location: locations[4]._id,
  },
  {
    title: "Caminhada Comunitária",
    description: "Atividade ao ar livre para toda a família.",
    date: new Date("2025-03-30"),
    time: "10:00",
    capacity: 60,
    status: "FINISHED",
    organizer: users[1]._id,
    participants: [users[4]._id, users[5]._id, users[6]._id],
    location: locations[3]._id,
  },
];

await Event.insertMany(events);

console.log("📅 Events created");

console.log("🌱 Database seeded successfully!");
process.exit();
