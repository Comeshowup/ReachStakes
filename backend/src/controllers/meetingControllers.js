
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// @desc    Book a new meeting
// @route   POST /api/meetings
// @access  Public (or Protected if needed)
export const createMeeting = async (req, res) => {
    try {
        const { name, email, role, date, timeSlot, agenda, userId } = req.body;

        if (!name || !email || !date || !timeSlot) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide all required fields (name, email, date, timeSlot)."
            });
        }

        const newMeeting = await prisma.meeting.create({
            data: {
                name,
                email,
                role: role || 'guest',
                date: new Date(date),
                timeSlot,
                agenda,
                userId: userId ? parseInt(userId) : null,
                status: 'Scheduled'
            }
        });

        res.status(201).json({
            status: "success",
            data: newMeeting,
            message: "Meeting scheduled successfully!"
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({
            status: "error",
            message: "Server Error: Could not schedule meeting."
        });
    }
};

// @desc    Get all meetings (Admin/Dashboard usage)
// @route   GET /api/meetings
// @access  Public (should be Protected in prod)
export const getMeetings = async (req, res) => {
    try {
        const meetings = await prisma.meeting.findMany({
            orderBy: { date: 'asc' }
        });

        res.status(200).json({
            status: "success",
            count: meetings.length,
            data: meetings
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
