const bearer = [{ bearerAuth: [] }];
const json = (schema) => ({ 'application/json': { schema } });
const ok = (description = 'Success') => ({ description, content: json({ type: 'object' }) });
const pathId = (name) => ({ name, in: 'path', required: true, schema: { type: 'string' } });

const playerSchema = {
  type: 'object', additionalProperties: false,
  required: ['id', 'name', 'shirtNumber', 'position'],
  properties: {
    id: { type: 'string', example: 'home-1' },
    name: { type: 'string', example: 'Alex Keeper' },
    shirtNumber: { type: 'integer', minimum: 1, maximum: 99, example: 1 },
    position: { type: 'string', enum: ['GOALKEEPER', 'OUTFIELD'] },
  },
};

const teamSchema = {
  type: 'object', additionalProperties: false,
  required: ['id', 'name', 'players'],
  properties: {
    id: { type: 'string', example: 'home' },
    name: { type: 'string', example: 'Northbridge FC' },
    players: { type: 'array', minItems: 7, maxItems: 11, items: playerSchema },
  },
};

const eventSchema = {
  type: 'object', additionalProperties: false,
  required: ['type', 'teamId', 'playerId', 'minute'],
  properties: {
    type: { type: 'string', enum: ['GOAL', 'YELLOW_CARD', 'RED_CARD'] },
    teamId: { type: 'string', example: 'home' },
    playerId: { type: 'string', example: 'home-9' },
    minute: { type: 'integer', minimum: 0, maximum: 90, example: 24 },
    addedMinute: { type: 'integer', minimum: 0, maximum: 30, default: 0 },
    ownGoal: { type: 'boolean', default: false, description: 'For GOAL only. teamId receives the goal and playerId belongs to the opponent.' },
    reason: { type: 'string', example: 'Unsporting behaviour' },
  },
};

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Official Football Match Record API',
    version: '1.0.0',
    description: 'Event-sourced recording with referee mutations, reporter read access, and validations based on IFAB Laws 3, 5, 7, 10 and 12 (2026/27).',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
  tags: [
    { name: 'Authentication' },
    { name: 'Matches' },
    { name: 'Official events' },
    { name: 'Reporting' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Player: playerSchema,
      Team: teamSchema,
      MatchEventInput: eventSchema,
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' }, message: { type: 'string' },
              details: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'], summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: json({
            type: 'object', required: ['email', 'password'],
            properties: {
              email: { type: 'string', example: 'referee@demo.local' },
              password: { type: 'string', example: 'Referee123!' },
            },
          }),
        },
        responses: { 200: ok('Authenticated'), 401: ok('Invalid credentials') },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'], summary: 'Inspect authenticated identity', security: bearer,
        responses: { 200: ok('Identity'), 401: ok('Missing or invalid token') },
      },
    },
    '/matches': {
      post: {
        tags: ['Matches'], summary: 'Start a match',
        description: 'REFEREE only. Both teams require 7–11 unique starters and exactly one goalkeeper.',
        security: bearer,
        requestBody: {
          required: true,
          content: json({
            type: 'object', required: ['homeTeam', 'awayTeam'],
            properties: {
              competition: { type: 'string', example: 'Premier Division' },
              venue: { type: 'string', example: 'Main Stadium' },
              halfDurationMinutes: { type: 'integer', enum: [45], default: 45 },
              homeTeam: teamSchema, awayTeam: teamSchema,
            },
          }),
        },
        responses: { 201: ok('Match started'), 400: ok('IFAB validation failed'), 403: ok('Wrong role') },
      },
      get: {
        tags: ['Reporting'], summary: 'List projected official match states', security: bearer,
        responses: { 200: ok('Matches'), 403: ok('Wrong role') },
      },
    },
    '/matches/{matchId}': {
      get: {
        tags: ['Reporting'], summary: 'Get score, status, discipline and history', security: bearer,
        parameters: [pathId('matchId')], responses: { 200: ok('Projected match'), 404: ok('Not found') },
      },
    },
    '/matches/{matchId}/events': {
      post: {
        tags: ['Official events'], summary: 'Record a goal, yellow card or red card',
        description: 'REFEREE only. A second yellow automatically sends the player off.',
        security: bearer, parameters: [pathId('matchId')],
        requestBody: { required: true, content: json(eventSchema) },
        responses: { 201: ok('Event recorded'), 400: ok('Rule validation failed'), 409: ok('Match not in progress') },
      },
    },
    '/matches/{matchId}/events/{eventId}/corrections': {
      post: {
        tags: ['Official events'], summary: 'Append an event correction',
        description: 'REFEREE only. Use replacement: null to void; otherwise supply the full corrected event. Audit history is retained.',
        security: bearer, parameters: [pathId('matchId'), pathId('eventId')],
        requestBody: {
          required: true,
          content: json({
            type: 'object', required: ['reason', 'replacement'],
            properties: {
              reason: { type: 'string', minLength: 5, example: 'Wrong player selected' },
              replacement: { nullable: true, ...eventSchema },
            },
          }),
        },
        responses: { 201: ok('Correction appended'), 400: ok('Corrected record violates a rule'), 404: ok('Not found') },
      },
    },
    '/matches/{matchId}/end': {
      post: {
        tags: ['Matches'], summary: 'Complete or abandon a match', security: bearer,
        description: 'REFEREE only. Completed regulation matches cannot end before minute 90; abandonment requires a reason.',
        parameters: [pathId('matchId')],
        requestBody: {
          required: true,
          content: json({
            type: 'object', required: ['outcome', 'minute'],
            properties: {
              outcome: { type: 'string', enum: ['COMPLETED', 'ABANDONED'] },
              minute: { type: 'integer', minimum: 0, maximum: 90, example: 90 },
              addedMinute: { type: 'integer', minimum: 0, maximum: 30, default: 0 },
              reason: { type: 'string', example: 'Unsafe weather conditions' },
            },
          }),
        },
        responses: { 200: ok('Final result confirmed'), 400: ok('Invalid duration/outcome'), 409: ok('Already ended') },
      },
    },
    '/laws': {
      get: {
        tags: ['Reporting'], summary: 'List IFAB validations implemented by the API',
        responses: { 200: ok('Rule references') },
      },
    },
  },
};
