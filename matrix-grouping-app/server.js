const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const lobbies = new Map();

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function assignBalancedExercise(lobby) {
  const counts = {};
  for (let i = 1; i <= lobby.exerciseCount; i++) counts[i] = 0;
  lobby.students.forEach((s) => {
    counts[s.exerciseId] = (counts[s.exerciseId] || 0) + 1;
  });

  const minCount = Math.min(...Object.values(counts));
  const candidateExercises = Object.keys(counts)
    .map(Number)
    .filter((exId) => counts[exId] === minCount);

  return candidateExercises[Math.floor(Math.random() * candidateExercises.length)];
}

function createMatrixGroups(lobby) {
  const buckets = {};
  for (let i = 1; i <= lobby.exerciseCount; i++) buckets[i] = [];
  lobby.students.forEach((s) => buckets[s.exerciseId].push(s));

  for (let i = 1; i <= lobby.exerciseCount; i++) {
    buckets[i] = shuffle(buckets[i]);
  }

  const maxGroupCount = Math.max(0, ...Object.values(buckets).map((b) => b.length));
  const groups = [];

  for (let g = 0; g < maxGroupCount; g++) {
    const members = [];
    for (let ex = 1; ex <= lobby.exerciseCount; ex++) {
      if (buckets[ex][g]) {
        buckets[ex][g].matrixGroupId = g + 1;
        members.push(buckets[ex][g]);
      }
    }
    groups.push({ id: g + 1, name: `Group ${g + 1}`, members });
  }

  lobby.groups = groups;
  lobby.status = 'GROUPED';
  return groups;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Configured for robust proxy/tunnel pass-through
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    socket.on('create_lobby', ({ exerciseCount }, callback) => {
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      const lobby = {
        code,
        exerciseCount: Number(exerciseCount),
        status: 'WAITING',
        students: [],
        groups: [],
      };
      lobbies.set(code, lobby);
      socket.join(code);
      if (typeof callback === 'function') {
        callback({ success: true, lobby });
      }
    });

    socket.on('join_lobby_channel', ({ code }) => {
      socket.join(code);
      const lobby = lobbies.get(code);
      if (lobby) socket.emit('lobby_state', lobby);
    });

    socket.on('student_join', ({ code, name }, callback) => {
      const lobby = lobbies.get(code);
      if (!lobby) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: 'Lobby not found' });
        }
        return;
      }

      const assignedExerciseId = assignBalancedExercise(lobby);
      const student = { id: socket.id, name, exerciseId: assignedExerciseId };

      lobby.students.push(student);
      socket.join(code);
      io.to(code).emit('lobby_state', lobby);

      if (typeof callback === 'function') {
        callback({ success: true, student, lobby });
      }
    });

    socket.on('trigger_grouping', ({ code }) => {
      const lobby = lobbies.get(code);
      if (!lobby) return;
      createMatrixGroups(lobby);
      io.to(code).emit('groups_formed', lobby);
    });

    socket.on('disconnect', () => {
      lobbies.forEach((lobby, code) => {
        const index = lobby.students.findIndex((s) => s.id === socket.id);
        if (index !== -1) {
          lobby.students.splice(index, 1);
          io.to(code).emit('lobby_state', lobby);
        }
      });
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});