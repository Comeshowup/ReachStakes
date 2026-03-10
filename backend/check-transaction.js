import { PrismaClient } from "@prisma/client";
import 'dotenv/config';

const prisma = new PrismaClient({
    log: ["query", "error", "warn"],
});

async function main() {
    console.log("Starting transaction test...");
    try {
        const result = await prisma.$transaction(async (tx) => {
            console.log("Inside transaction...");
            const tempEmail = `test-${Date.now()}@example.com`;
            const user = await tx.user.create({
                data: {
                    name: "Test User",
                    email: tempEmail,
                    role: "brand",
                },
            });
            console.log("User created:", user.id);

            const profile = await tx.brandProfile.create({
                data: {
                    userId: user.id,
                    companyName: "Test Company",
                    contactEmail: tempEmail,
                },
            });
            console.log("Profile created:", profile.userId);

            return { user, profile };
        }, {
            timeout: 10000 // Increase timeout to 10s for testing
        });

        console.log("Transaction successful:", result.user.id);

        // Cleanup
        await prisma.brandProfile.delete({ where: { userId: result.user.id } });
        await prisma.user.delete({ where: { id: result.user.id } });
        console.log("Cleanup successful.");

    } catch (error) {
        console.error("Transaction failed with error:");
        console.error(error);
        if (error.code) console.error("Prisma Error Code:", error.code);
        if (error.meta) console.error("Prisma Meta:", error.meta);
    } finally {
        await prisma.$disconnect();
    }
}

main();
