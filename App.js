const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const socketio = require('socket.io');

const User = require('../models/User');
const Message = require('../models/Message');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect DB
mongoose.connect('mongodb://localhost:27017/chatapp');

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/chatapp' })
}));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
const authRoutes = require('../routes/auth');
app.use(authRoutes);

app.get('/chat', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const messages = await Message.find().sort('timestamp');
  res.render('chat', { user: req.session.user.username, messages });
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Socket.IO logic
io.on('connection', socket => {
  socket.on('joinRoom', async ({ username, room }) => {
    socket.join(room);
    await User.findOneAndUpdate({ username }, { online: true });
    io.to(room).emit('userStatus', { username, online: true });

    socket.on('message', async msg => {
      const message = await Message.create(msg);
      io.to(room).emit('message', message);
    });

    socket.on('disconnect', async () => {
      await User.findOneAndUpdate({ username }, { online: false });
      io.to(room).emit('userStatus', { username, online: false });
    });
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
