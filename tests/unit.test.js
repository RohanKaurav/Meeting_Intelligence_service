const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const { successResponse, errorResponse } = require('../lib/response');
const { traceIdMiddleware } = require('../middleware/trace');
const errorHandler = require('../middleware/error');
const authenticateToken = require('../middleware/auth');


test('Response Utility - successResponse format matches schema', () => {
    let statusCode = 0;
    let responseData = null;
    
    const mockRes = {
        locals: { traceId: 'test-trace-123' },
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        }
    };
    
    successResponse(mockRes, { user: 'Bob' }, 201);
    
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.traceId, 'test-trace-123');
    assert.deepStrictEqual(responseData.data, { user: 'Bob' });
});

test('Response Utility - errorResponse format matches schema', () => {
    let statusCode = 0;
    let responseData = null;
    
    const mockRes = {
        locals: { traceId: 'test-trace-456' },
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        }
    };
    
    errorResponse(mockRes, 'NOT_FOUND', 'Entity not found', 404);
    
    assert.strictEqual(statusCode, 404);
    assert.strictEqual(responseData.success, false);
    assert.strictEqual(responseData.traceId, 'test-trace-456');
    assert.strictEqual(responseData.error.code, 'NOT_FOUND');
    assert.strictEqual(responseData.error.message, 'Entity not found');
});

test('Trace ID Middleware - generates new trace ID when header is absent', () => {
    const mockReq = { headers: {} };
    let headerKey = '';
    let headerVal = '';
    const mockRes = {
        locals: {},
        setHeader(key, val) {
            headerKey = key;
            headerVal = val;
        }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    traceIdMiddleware(mockReq, mockRes, next);
    
    assert.ok(mockReq.traceId);
    assert.strictEqual(mockReq.traceId, mockRes.locals.traceId);
    assert.strictEqual(headerKey, 'x-trace-id');
    assert.strictEqual(headerVal, mockReq.traceId);
    assert.strictEqual(nextCalled, true);
});


test('Auth Middleware - returns 401 when token is missing', () => {
    const mockReq = { headers: {} };
    let responseCode = 0;
    let responseBody = null;
    const mockRes = {
        locals: { traceId: 'auth-trace' },
        status(code) {
            responseCode = code;
            return this;
        },
        json(data) {
            responseBody = data;
            return this;
        }
    };
    
    authenticateToken(mockReq, mockRes, () => {});
    
    assert.strictEqual(responseCode, 401);
    assert.strictEqual(responseBody.success, false);
    assert.strictEqual(responseBody.error.code, 'UNAUTHORIZED');
});


test('Global Error Handler - handles normal errors', () => {
    const error = new Error('Test DB Error');
    error.status = 500;
    
    const mockReq = {};
    let responseCode = 0;
    let responseBody = null;
    
    const mockRes = {
        locals: { traceId: 'err-trace' },
        headersSent: false,
        status(code) {
            responseCode = code;
            return this;
        },
        json(data) {
            responseBody = data;
            return this;
        }
    };
    
    errorHandler(error, mockReq, mockRes, () => {});
    
    assert.strictEqual(responseCode, 500);
    assert.strictEqual(responseBody.success, false);
    assert.strictEqual(responseBody.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(responseBody.error.message, 'Test DB Error');
});

test('Global Error Handler - transforms ZodError to VALIDATION_ERROR response', () => {
    const zodError = {
        name: 'ZodError',
        errors: [
            { path: ['title'], message: 'Required' },
            { path: ['email'], message: 'Invalid email' }
        ]
    };
    
    const mockReq = {};
    let responseCode = 0;
    let responseBody = null;
    
    const mockRes = {
        locals: { traceId: 'zod-trace' },
        headersSent: false,
        status(code) {
            responseCode = code;
            return this;
        },
        json(data) {
            responseBody = data;
            return this;
        }
    };
    
    errorHandler(zodError, mockReq, mockRes, () => {});
    
    assert.strictEqual(responseCode, 400);
    assert.strictEqual(responseBody.success, false);
    assert.strictEqual(responseBody.error.code, 'VALIDATION_ERROR');
    assert.strictEqual(responseBody.error.message, 'title: Required, email: Invalid email');
});
