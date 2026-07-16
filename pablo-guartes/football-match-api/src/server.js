import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { openapi } from './openapi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, '..', 'data', 'store.json');
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-before-production';

const users = [
  { id: 'referee-1', email: 'referee@demo.local', name: 'Demo Referee', role: 'REFEREE', passwordHash: bcrypt.hashSync(process.env.REFEREE_PASSWORD || 'Referee123!', 10) },
  { id: 'reporter-1', email: 'reporter@demo.local', name: 'Demo Reporter', role: 'MATCH_REPORTER', passwordHash: bcrypt.hashSync(process.env.REPORTER_PASSWORD || 'Reporter123!', 10) },
];

const laws = [
  { law: 3, title: 'The Players', validation: 'Two teams, 7–11 starters each, exactly one goalkeeper; match cannot continue below seven.', url: 'https://www.theifab.com/laws/latest/the-players/' },
  { law: 5, title: 'The Referee', validation: 'Only the referee role controls the match, records events and maintains the official record.', url: 'https://www.theifab.com/laws/latest/the-referee/' },
  { law: 7, title: 'The Duration of the Match', validation: 'Two 45-minute halves; a completed regulation match cannot be ended before minute 90.', url: 'https://www.theifab.com/laws/latest/the-duration-of-the-match/' },
  { law: 10, title: 'Determining the Outcome', validation: 'Effective goal events derive the score, draw and winner.', url: 'https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/' },
  { law: 12, title: 'Fouls and Misconduct', validation: 'Yellow means caution, red means sending-off; a second yellow sends the player off.', url: 'https://www.theifab.com/laws/latest/fouls-and-misconduct/' },
];

class ApiError extends Error {
  constructor(status, code, message, details = []) { super(message); this.status = status; this.code = code; this.details = details; }
}

function loadStore(){
  try { return JSON.parse(readFileSync(dataFile, 'utf8')); }
  catch { return { matches: [] }; }
}
let store = loadStore();

function saveStore(){
  mkdirSync(dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.tmp`;
  writeFileSync(temporary, JSON.stringify(store, null, 2));
  renameSync(temporary, dataFile);
}

function cleanString(value, field, min = 1, max = 100){
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new ApiError(400, 'VALIDATION_ERROR', `${field} must contain ${min}–${max} characters.`);
  return value.trim();
}

function validateTeam(team, label){
  if (!team || typeof team !== 'object') throw new ApiError(400, 'LAW_3_INVALID_TEAM', `${label} is required.`);
  const normalized = { id: cleanString(team.id, `${label}.id`, 1, 40), name: cleanString(team.name, `${label}.name`, 1, 80), players: [] };
  if (!Array.isArray(team.players) || team.players.length < 7 || team.players.length > 11) throw new ApiError(400, 'LAW_3_PLAYER_COUNT', `${label} must name between 7 and 11 starting players.`);
  const ids = new Set(); const shirts = new Set(); let goalkeepers = 0;
  normalized.players = team.players.map((player, index) => {
    if (!player || typeof player !== 'object') throw new ApiError(400, 'LAW_3_INVALID_PLAYER', `${label}.players[${index}] is invalid.`);
    const item = {
      id: cleanString(player.id, `${label}.players[${index}].id`, 1, 40),
      name: cleanString(player.name, `${label}.players[${index}].name`, 1, 80),
      shirtNumber: Number(player.shirtNumber), position: player.position,
    };
    if (ids.has(item.id)) throw new ApiError(400, 'LAW_3_DUPLICATE_PLAYER', `Duplicate player id ${item.id} in ${label}.`);
    if (!Number.isInteger(item.shirtNumber) || item.shirtNumber < 1 || item.shirtNumber > 99 || shirts.has(item.shirtNumber)) throw new ApiError(400, 'INVALID_SHIRT_NUMBER', `${label} shirt numbers must be unique integers from 1 to 99.`);
    if (!['GOALKEEPER', 'OUTFIELD'].includes(item.position)) throw new ApiError(400, 'LAW_3_GOALKEEPER_REQUIRED', `${label} player position must be GOALKEEPER or OUTFIELD.`);
    ids.add(item.id); shirts.add(item.shirtNumber); if (item.position === 'GOALKEEPER') goalkeepers += 1;
    return item;
  });
  if (goalkeepers !== 1) throw new ApiError(400, 'LAW_3_GOALKEEPER_REQUIRED', `${label} must have exactly one goalkeeper.`);
  return normalized;
}

function getMatch(id){
  const match = store.matches.find(item => item.id === id);
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found.');
  return match;
}

function normalizeEvent(input, match){
  if (!input || typeof input !== 'object') throw new ApiError(400, 'INVALID_EVENT', 'Event body is required.');
  const type = input.type;
  if (!['GOAL', 'YELLOW_CARD', 'RED_CARD'].includes(type)) throw new ApiError(400, 'INVALID_EVENT_TYPE', 'type must be GOAL, YELLOW_CARD or RED_CARD.');
  const minute = Number(input.minute); const addedMinute = Number(input.addedMinute || 0);
  if (!Number.isInteger(minute) || minute < 0 || minute > match.halfDurationMinutes * 2) throw new ApiError(400, 'LAW_7_INVALID_MINUTE', `minute must be an integer from 0 to ${match.halfDurationMinutes * 2}.`);
  if (!Number.isInteger(addedMinute) || addedMinute < 0 || addedMinute > 30) throw new ApiError(400, 'LAW_7_INVALID_ADDED_TIME', 'addedMinute must be an integer from 0 to 30.');
  const event = { type, teamId: cleanString(input.teamId, 'teamId', 1, 40), playerId: cleanString(input.playerId, 'playerId', 1, 40), minute, addedMinute, ownGoal: Boolean(input.ownGoal), reason: input.reason ? cleanString(input.reason, 'reason', 1, 200) : null };
  if (type !== 'GOAL' && event.ownGoal) throw new ApiError(400, 'INVALID_OWN_GOAL', 'ownGoal is only valid for GOAL events.');
  return event;
}

function effectiveEvents(match, extraCorrection = null){
  const all = extraCorrection ? [...match.events, extraCorrection] : match.events;
  const corrections = new Map();
  all.filter(event => event.type === 'CORRECTION').forEach(event => corrections.set(event.targetEventId, event));
  return all.filter(event => event.type !== 'CORRECTION').map(event => {
    const correction = corrections.get(event.id);
    if (!correction) return { ...event, sourceEventId: event.id };
    if (correction.replacement === null) return null;
    return { ...event, ...correction.replacement, id: event.id, sourceEventId: event.id, correctedBy: correction.id };
  }).filter(Boolean);
}

function projectMatch(match, extraCorrection = null){
  const discipline = {};
  const score = { [match.homeTeam.id]: 0, [match.awayTeam.id]: 0 };
  const teams = new Map([[match.homeTeam.id, match.homeTeam], [match.awayTeam.id, match.awayTeam]]);
  const playerTeam = new Map();
  for (const team of teams.values()) for (const player of team.players) playerTeam.set(player.id, team.id);
  let previousMoment = -1;

  for (const event of effectiveEvents(match, extraCorrection)) {
    const moment = event.minute * 100 + event.addedMinute;
    if (moment < previousMoment) throw new ApiError(400, 'NON_CHRONOLOGICAL_EVENT', 'Effective event minutes must remain chronological.');
    previousMoment = moment;
    if (!teams.has(event.teamId)) throw new ApiError(400, 'UNKNOWN_TEAM', `Unknown team ${event.teamId}.`);
    const actualTeamId = playerTeam.get(event.playerId);
    if (!actualTeamId) throw new ApiError(400, 'UNKNOWN_PLAYER', `Unknown player ${event.playerId}.`);
    const playerState = discipline[event.playerId] ||= { yellowCards: 0, redCard: false, sentOff: false };
    if (playerState.sentOff) throw new ApiError(400, 'LAW_12_PLAYER_SENT_OFF', `Player ${event.playerId} was already sent off and cannot participate in a later event.`);

    if (event.type === 'GOAL') {
      const expectedPlayerTeam = event.ownGoal ? [...teams.keys()].find(id => id !== event.teamId) : event.teamId;
      if (actualTeamId !== expectedPlayerTeam) throw new ApiError(400, 'LAW_10_INVALID_SCORER', event.ownGoal ? 'An own-goal scorer must belong to the opposing team.' : 'The scorer must belong to the team awarded the goal.');
      score[event.teamId] += 1;
    } else {
      if (actualTeamId !== event.teamId) throw new ApiError(400, 'LAW_12_INVALID_PLAYER_TEAM', 'The sanctioned player must belong to teamId.');
      if (event.type === 'YELLOW_CARD') {
        playerState.yellowCards += 1;
        if (playerState.yellowCards >= 2) { playerState.redCard = true; playerState.sentOff = true; playerState.sendOffReason = 'SECOND_YELLOW'; }
      } else { playerState.redCard = true; playerState.sentOff = true; playerState.sendOffReason = 'DIRECT_RED'; }
    }
  }

  const activePlayers = {};
  for (const team of teams.values()) activePlayers[team.id] = team.players.length - team.players.filter(player => discipline[player.id]?.sentOff).length;
  const law3Abandonment = Object.values(activePlayers).some(count => count < 7);
  let status = 'IN_PROGRESS';
  if (match.ended?.outcome === 'COMPLETED') status = 'FINISHED';
  else if (match.ended?.outcome === 'ABANDONED' || law3Abandonment) status = 'ABANDONED';
  const homeGoals = score[match.homeTeam.id]; const awayGoals = score[match.awayTeam.id];
  const result = status === 'FINISHED' ? (homeGoals === awayGoals ? 'DRAW' : homeGoals > awayGoals ? 'HOME_WIN' : 'AWAY_WIN') : null;
  return { status, score: { home: homeGoals, away: awayGoals }, result, discipline, activePlayers, law3Abandonment };
}

function serializeMatch(match){
  const projection = projectMatch(match);
  const latestCorrection = new Map();
  match.events.filter(e => e.type === 'CORRECTION').forEach(e => latestCorrection.set(e.targetEventId, e));
  const eventHistory = match.events.map(event => event.type === 'CORRECTION' ? event : { ...event, effective: !latestCorrection.has(event.id) || latestCorrection.get(event.id).replacement !== null, correctedBy: latestCorrection.get(event.id)?.id || null });
  return { id: match.id, competition: match.competition, venue: match.venue, homeTeam: match.homeTeam, awayTeam: match.awayTeam, startedAt: match.startedAt, ended: match.ended, ...projection, eventHistory, links: { self: `/matches/${match.id}`, events: `/matches/${match.id}/events` } };
}

function authenticate(req, _res, next){
  try {
    const value = req.headers.authorization || '';
    if (!value.startsWith('Bearer ')) throw new ApiError(401, 'AUTH_REQUIRED', 'A Bearer token is required.');
    req.user = jwt.verify(value.slice(7), jwtSecret);
    next();
  } catch (error) { next(error instanceof ApiError ? error : new ApiError(401, 'INVALID_TOKEN', 'Token is invalid or expired.')); }
}
const allow = (...roles) => (req, _res, next) => roles.includes(req.user.role) ? next() : next(new ApiError(403, 'FORBIDDEN', `Requires one of these roles: ${roles.join(', ')}.`));

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Football Match API' }));
app.get('/openapi.json', (_req, res) => res.json(openapi));
app.get('/', (_req, res) => res.json({ name: openapi.info.title, version: openapi.info.version, docs: '/docs', health: '/health' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/laws', (_req, res) => res.json({ edition: 'IFAB Laws of the Game 2026/27', rules: laws }));

app.post('/auth/login', (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = users.find(item => item.email === email);
    if (!user || !bcrypt.compareSync(String(req.body?.password || ''), user.passwordHash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, jwtSecret, { expiresIn: '8h', issuer: 'football-match-api', audience: 'football-match-clients' });
    res.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 28800, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) { next(error); }
});
app.get('/auth/me', authenticate, (req, res) => res.json({ user: req.user }));

app.post('/matches', authenticate, allow('REFEREE'), (req, res, next) => {
  try {
    const homeTeam = validateTeam(req.body?.homeTeam, 'homeTeam'); const awayTeam = validateTeam(req.body?.awayTeam, 'awayTeam');
    if (homeTeam.id === awayTeam.id || homeTeam.name.toLowerCase() === awayTeam.name.toLowerCase()) throw new ApiError(400, 'TEAMS_MUST_DIFFER', 'Home and away teams must be different.');
    const allIds = [...homeTeam.players, ...awayTeam.players].map(player => player.id);
    if (new Set(allIds).size !== allIds.length) throw new ApiError(400, 'LAW_3_DUPLICATE_PLAYER', 'Player IDs must be unique across both team sheets.');
    if (req.body?.halfDurationMinutes !== undefined && Number(req.body.halfDurationMinutes) !== 45) throw new ApiError(400, 'LAW_7_DURATION', 'This API models regulation adult football: two equal halves of 45 minutes.');
    const match = { id: randomUUID(), competition: req.body?.competition ? cleanString(req.body.competition, 'competition', 1, 100) : null, venue: req.body?.venue ? cleanString(req.body.venue, 'venue', 1, 100) : null, halfDurationMinutes: 45, homeTeam, awayTeam, refereeId: req.user.sub, startedAt: new Date().toISOString(), ended: null, events: [] };
    store.matches.push(match); saveStore(); res.status(201).json(serializeMatch(match));
  } catch (error) { next(error); }
});

app.get('/matches', authenticate, allow('REFEREE', 'MATCH_REPORTER'), (_req, res, next) => { try { res.json({ matches: store.matches.map(serializeMatch) }); } catch (error) { next(error); } });
app.get('/matches/:matchId', authenticate, allow('REFEREE', 'MATCH_REPORTER'), (req, res, next) => { try { res.json(serializeMatch(getMatch(req.params.matchId))); } catch (error) { next(error); } });

app.post('/matches/:matchId/events', authenticate, allow('REFEREE'), (req, res, next) => {
  try {
    const match = getMatch(req.params.matchId); const projection = projectMatch(match);
    if (projection.status !== 'IN_PROGRESS') throw new ApiError(409, 'MATCH_NOT_IN_PROGRESS', 'Events can only be recorded while the match is in progress.');
    const input = normalizeEvent(req.body, match);
    const last = effectiveEvents(match).at(-1); const moment = input.minute * 100 + input.addedMinute;
    if (last && moment < last.minute * 100 + last.addedMinute) throw new ApiError(400, 'NON_CHRONOLOGICAL_EVENT', 'Event minute cannot be earlier than the latest effective event.');
    const event = { id: randomUUID(), ...input, recordedAt: new Date().toISOString(), recordedBy: req.user.sub };
    match.events.push(event); projectMatch(match); saveStore();
    res.status(201).json({ event, match: serializeMatch(match), resultingSendOff: serializeMatch(match).discipline[input.playerId]?.sentOff || false });
  } catch (error) { next(error); }
});

app.post('/matches/:matchId/events/:eventId/corrections', authenticate, allow('REFEREE'), (req, res, next) => {
  try {
    const match = getMatch(req.params.matchId); const target = match.events.find(event => event.id === req.params.eventId && event.type !== 'CORRECTION');
    if (!target) throw new ApiError(404, 'EVENT_NOT_FOUND', 'Correctable event not found.');
    const reason = cleanString(req.body?.reason, 'reason', 5, 300);
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'replacement')) throw new ApiError(400, 'REPLACEMENT_REQUIRED', 'replacement must be a corrected event or null to void the event.');
    const replacement = req.body.replacement === null ? null : normalizeEvent(req.body.replacement, match);
    const correction = { id: randomUUID(), type: 'CORRECTION', targetEventId: target.id, replacement, reason, recordedAt: new Date().toISOString(), recordedBy: req.user.sub };
    projectMatch(match, correction);
    match.events.push(correction); saveStore(); res.status(201).json({ correction, match: serializeMatch(match) });
  } catch (error) { next(error); }
});

app.post('/matches/:matchId/end', authenticate, allow('REFEREE'), (req, res, next) => {
  try {
    const match = getMatch(req.params.matchId); const projection = projectMatch(match);
    if (match.ended || projection.status !== 'IN_PROGRESS') throw new ApiError(409, 'MATCH_ALREADY_ENDED', 'Match is already finished or abandoned.');
    const outcome = req.body?.outcome; const minute = Number(req.body?.minute); const addedMinute = Number(req.body?.addedMinute || 0);
    if (!['COMPLETED', 'ABANDONED'].includes(outcome)) throw new ApiError(400, 'INVALID_OUTCOME', 'outcome must be COMPLETED or ABANDONED.');
    if (!Number.isInteger(minute) || minute < 0 || minute > 90 || !Number.isInteger(addedMinute) || addedMinute < 0 || addedMinute > 30) throw new ApiError(400, 'LAW_7_INVALID_END_TIME', 'minute must be 0–90 and addedMinute 0–30.');
    if (outcome === 'COMPLETED' && minute < 90) throw new ApiError(400, 'LAW_7_TOO_EARLY', 'A completed regulation match cannot end before minute 90. Use ABANDONED with a reason instead.');
    const reason = req.body?.reason ? cleanString(req.body.reason, 'reason', 3, 300) : null;
    if (outcome === 'ABANDONED' && !reason) throw new ApiError(400, 'ABANDONMENT_REASON_REQUIRED', 'An abandoned match requires a reason.');
    match.ended = { outcome, minute, addedMinute, reason, endedAt: new Date().toISOString(), recordedBy: req.user.sub };
    saveStore(); res.json(serializeMatch(match));
  } catch (error) { next(error); }
});

app.use((_req, _res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND', 'Route not found.')));
app.use((error, _req, res, _next) => {
  const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
  const code = error.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  if (status === 500) console.error(error);
  res.status(status).json({ error: { code, message: status === 500 ? 'Unexpected server error.' : error.message, details: error.details || [] } });
});

if (!existsSync(dataFile)) saveStore();
app.listen(port, '0.0.0.0', () => console.log(`Football Match API listening at http://localhost:${port} — Swagger: /docs`));
