const { prisma } = require('../lib/db');
const { successResponse, errorResponse } = require('../lib/response');
const { z } = require('zod');

const createActionItemSchema = z.object({
    meetingId: z.string().uuid('Invalid meeting ID'),
    task: z.string().min(1, 'Task description is required'),
    assignee: z.string().min(1, 'Assignee name is required'),
    dueDate: z.string().datetime({ message: 'Invalid due date format' }).transform(val => new Date(val)),
    citations: z.array(z.object({
        timestamp: z.string().min(1, 'Timestamp is required')
    })).default([])
});


const updateStatusSchema = z.object({
    status:z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'],{
        errorMap:()=>({
            message:"Status must be PENDING, IN_PROGRESS, or COMPLETED"
        })
    })
});

async function createActionItem(req, res, next) {
    try {
        const validatedData = createActionItemSchema.parse(req.body);
        
        const meeting = await prisma.meeting.findUnique({
            where: { id: validatedData.meetingId }
        });
        if (!meeting) {
            return errorResponse(res, 'NOT_FOUND', 'Associated meeting not found', 404);
        }
        const actionItem = await prisma.actionItem.create({
            data: {
                meetingId: validatedData.meetingId,
                task: validatedData.task,
                assignee: validatedData.assignee,
                dueDate: validatedData.dueDate,
                citations: validatedData.citations
            }
        });
        return successResponse(res, actionItem, 201);
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { id } = req.params;
        const validatedData = updateStatusSchema.parse(req.body);
        const actionItem = await prisma.actionItem.findUnique({
            where: { id }
        });
        if (!actionItem) {
            return errorResponse(res, 'NOT_FOUND', 'Action item not found', 404);
        }
        const updatedItem = await prisma.actionItem.update({
            where: { id },
            data: { status: validatedData.status }
        });
        return successResponse(res, updatedItem);
    } catch (error) {
        next(error);
    }
}

async function listActionItems(req, res, next) {
    try {
        const { status, assignee, meetingId } = req.query;
        
        const where = {};
        if (status) {
            where.status = status;
        }
        if (assignee) {
            where.assignee = {
                contains: assignee,
                mode: 'insensitive'
            };
        }
        if (meetingId) {
            where.meetingId = meetingId;
        }
        const actionItems = await prisma.actionItem.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return successResponse(res, actionItems);
    } catch (error) {
        next(error);
    }
}

async function getOverdueActionItems(req, res, next) {
    try {
        const overdueItems = await prisma.actionItem.findMany({
            where: {
                status: { not: 'COMPLETED' },
                dueDate: { lt: new Date() }
            },
            orderBy: { dueDate: 'asc' }
        });
        return successResponse(res, overdueItems);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createActionItem,
    updateStatus,
    listActionItems,
    getOverdueActionItems
};