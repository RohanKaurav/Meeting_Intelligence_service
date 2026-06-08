const  {prisma}  = require('../lib/db');
const { successResponse, errorResponse } = require('../lib/response');
const { runAIAnalysis } = require('../services/ai');

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

async function analyzeMeeting(req, res, next){
    try{
        const { id } = req.params;
        const meeting =await prisma.meeting.findUnique({
            where:{id}
        });

        if (!meeting) {
            return errorResponse(res, 'NOT_FOUND', 'Meeting not found', 404);
        }
        const analysisResult = await runAIAnalysis(meeting.transcript);

        const defaultDueDate = new Date(meeting.meetingDate);
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);

        const savedData = await prisma.$transaction( async (tx) => {
            await tx.meetingAnalysis.deleteMany({
                where:{ meetingId: id}
            });
            const analysis = await tx.meetingAnalysis.create({
                data:{
                    meetingId: id,
                    summary: analysisResult.summary,
                    decisions: analysisResult.decisions,
                    followUps: analysisResult.followUps
                }
            });

            const actionItems = [];
            if(analysisResult.actionItems && analysisResult.actionItems.length > 0){
                 for (const item of analysisResult.actionItems) {
                    const createdItem = await tx.actionItem.create({
                        data: {
                            meetingId: id,
                            task: item.task,
                            assignee: item.assignee,
                            dueDate: defaultDueDate,
                            citations: item.citations,
                            status: 'PENDING'
                        }
                    });
                    actionItems.push(createdItem);
                }
            }
            return { analysis, actionItems };
            
        })
         return successResponse(res, {
            summary: savedData.analysis.summary,
            decisions: savedData.analysis.decisions,
            followUps: savedData.analysis.followUps,
            actionItems: savedData.actionItems.map(item => ({
                id: item.id,
                task: item.task,
                assignee: item.assignee,
                dueDate: item.dueDate,
                status: item.status,
                citations: item.citations
            }))
        });

    }catch(error){
        next(error);
    }
}

module.exports = {
    createMeeting,
    getMeeting,
    listMeetings,
    analyzeMeeting
}