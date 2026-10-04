// Usage: npm run admin:create -- you@example.com "Your Name" 'a-long-password'
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-hash";

const [email, name, password] = process.argv.slice(2);
if (!email || !name || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- <email> "<name>" <password (10+ chars)>');
  process.exit(1);
}
const prisma = new PrismaClient();
const lower = email.toLowerCase();
const passwordHash = hashPassword(password);

prisma.adminUser
  .upsert({ where: { email: lower }, update: { name, passwordHash, role: "ADMIN", isActive: true }, create: { email: lower, name, passwordHash, role: "ADMIN" } })
  .then(() => console.log(`Admin ready: ${lower}`))
  .finally(() => prisma.$disconnect());
