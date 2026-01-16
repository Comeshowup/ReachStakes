import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColumns() {
    try {
        const result = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'brand_profiles' 
      AND COLUMN_NAME IN ('primary_goal', 'budget_range', 'launch_timeline', 'team_emails');
    `;
        console.log('Found columns:', result);

        if (result.length === 4) {
            console.log("SUCCESS: All columns found.");
        } else {
            console.log("FAILURE: Missing columns.");
        }
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumns();
