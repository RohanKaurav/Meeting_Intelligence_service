const  {prisma}  = require('../lib/db');
const { successResponse, errorResponse } = require('../lib/response')
const { z } = require('zod');

const createMeetingSchema = z.object({
    title: z.string().min(1, "Meeting title is required"),
    participants: z.array(z.string().email('invalid email address')).nonempty('at least one participant is required'),
    meetingDate: z.string().datetime({message:'Invalid meeting date format'}).transform(val => new Date(val)),
    transcript: z.array(z.object({
        timestamp: z.string().min(1,'Timestamp is required'),
        speaker: z.string().min(1,'Speaker is required'),
        text: z.string().min(1,'Text is required'),
        
    })).nonempty('Transcript cannot be empty')
});


async function createMeeting(req, res, next) {
    try {
        const validatedData = createMeetingSchema.parse(req.body);
        
        const meeting = await prisma.meeting.create({
            data: {
                title: validatedData.title,
                participants: validatedData.participants,
                meetingDate: validatedData.meetingDate,
                transcript: validatedData.transcript
            }
        });
        
        return successResponse(res, meeting, 201);
    } catch (error) {
        next(error);
    }
}


async function getMeeting(req, res, next){
    try{
        const { id } = req.params;
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include:{
                analysis: true,
                actionItems: true
            }
        });
        if(!meeting){
            return errorResponse(res, 'NOT_FOUND', 'Meeting not found', 404);
        }
        return successResponse(res, meeting, 200);
    }catch(error){
        next(error)
    }
}

async function listMeetings(req, res, next){
    try{
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit,10) || 10;
        const skip = (page -1 ) * limit;

        const[meetings, total] = await prisma.$transaction([
            prisma.meeting.findMany({
                skip,
                take:limit,
                orderBy:{ meetingDate: 'desc'}
            }),
            prisma.meeting.count()
        ])

        return successResponse(res, {
            meetings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    }catch(error){
        next(error);
    }
}

module.exports = {
    createMeeting,
    getMeeting,
    listMeetings
}