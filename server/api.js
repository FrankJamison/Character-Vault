const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');

const router = express.Router();

const DB_PATH = path.join(__dirname, 'data', 'db.json');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = Number(
    process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS || 60 * 60
);

const readDb = () => {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
};

const writeDb = (db) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
};

const publicUser = (user) => ({
    user_id: user.user_id,
    username: user.username,
    email: user.email,
});

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return res.status(401).json({
            msg: 'Missing Authorization header'
        });
    }

    try {
        const payload = jwt.verify(match[1], JWT_SECRET);

        const userId = Number(payload.sub);
        if (!Number.isFinite(userId)) {
            return res.status(401).json({
                msg: 'Invalid token subject'
            });
        }

        req.user = {
            user_id: userId,
            username: payload.username,
        };
        return next();
    } catch (err) {
        return res.status(401).json({
            msg: 'Invalid token'
        });
    }
};

// -------------------- AUTH --------------------

router.post('/auth/register', async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).json({
            msg: 'username, email, password are required'
        });
    }

    const db = readDb();

    const usernameTaken = db.users.some(
        (u) => u.username.toLowerCase() === String(username).toLowerCase()
    );
    if (usernameTaken) {
        return res.status(409).json({
            msg: 'Username already exists'
        });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const user = {
        user_id: db.nextIds.user++,
        username: String(username),
        email: String(email),
        password_hash,
        refresh_tokens: [],
        created_date: new Date().toISOString(),
    };

    db.users.push(user);
    writeDb(db);

    return res.json({
        msg: 'Registered'
    });
});

router.post('/auth/login', async (req, res) => {
    const {
        username,
        password
    } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            auth: false,
            msg: 'username and password are required'
        });
    }

    const db = readDb();
    const user = db.users.find(
        (u) => u.username.toLowerCase() === String(username).toLowerCase()
    );

    if (!user) {
        return res.status(401).json({
            auth: false,
            msg: 'Invalid username or password'
        });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
        return res.status(401).json({
            auth: false,
            msg: 'Invalid username or password'
        });
    }

    const access_token = jwt.sign({
            username: user.username
        },
        JWT_SECRET, {
            subject: String(user.user_id),
            expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }
    );

    const refresh_token = crypto.randomBytes(32).toString('hex');
    user.refresh_tokens.push(refresh_token);
    writeDb(db);

    return res.json({
        auth: true,
        expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        access_token,
        refresh_token,
    });
});

// -------------------- USER --------------------

router.get('/user/me', requireAuth, (req, res) => {
    const db = readDb();
    const user = db.users.find((u) => u.user_id === req.user.user_id);

    if (!user) {
        return res.status(404).json({
            msg: 'User not found'
        });
    }

    // Frontend expects an array: userService.getMe().then(([user]) => ...)
    return res.json([publicUser(user)]);
});

router.put('/user/me/update', requireAuth, async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body || {};

    const db = readDb();
    const user = db.users.find((u) => u.user_id === req.user.user_id);

    if (!user) {
        return res.status(404).json({
            msg: 'User not found'
        });
    }

    if (username) {
        const usernameTaken = db.users.some(
            (u) =>
            u.user_id !== user.user_id &&
            u.username.toLowerCase() === String(username).toLowerCase()
        );
        if (usernameTaken) {
            return res.status(409).json({
                msg: 'Username already exists'
            });
        }
        user.username = String(username);
    }

    if (email) {
        user.email = String(email);
    }

    if (password) {
        user.password_hash = await bcrypt.hash(String(password), 10);
    }

    writeDb(db);
    return res.json({
        msg: 'Updated'
    });
});

// -------------------- TASKS --------------------

router.get('/tasks', requireAuth, (req, res) => {
    const db = readDb();
    const tasks = db.tasks.filter((t) => t.user_id === req.user.user_id);
    return res.json(tasks);
});

router.post('/tasks', requireAuth, (req, res) => {
    const {
        task_name,
        status
    } = req.body || {};
    if (!task_name || !status) {
        return res.status(400).json({
            msg: 'task_name and status are required'
        });
    }

    const db = readDb();
    const task = {
        task_id: db.nextIds.task++,
        user_id: req.user.user_id,
        task_name: String(task_name),
        status: String(status),
        created_date: new Date().toISOString(),
    };

    db.tasks.push(task);
    writeDb(db);
    return res.json(task);
});

router.delete('/tasks/:taskId', requireAuth, (req, res) => {
    const taskId = Number(req.params.taskId);

    const db = readDb();
    const before = db.tasks.length;
    db.tasks = db.tasks.filter((t) => !(t.task_id === taskId && t.user_id === req.user.user_id));

    if (db.tasks.length === before) {
        return res.status(404).json({
            msg: 'Task not found'
        });
    }

    writeDb(db);
    return res.json({
        msg: 'Deleted'
    });
});

// -------------------- CHARACTERS --------------------

router.get('/characters', requireAuth, (req, res) => {
    const db = readDb();
    const characters = db.characters.filter((c) => c.user_id === req.user.user_id);
    return res.json(characters);
});

router.post('/characters', requireAuth, (req, res) => {
    const {
        character_name,
        character_race,
        character_class,
        character_build,
        character_level,
        character_sheet,
        character_image,
    } = req.body || {};

    const required = [
        character_name,
        character_race,
        character_class,
        character_build,
        character_level,
        character_sheet,
        character_image,
    ];

    if (required.some((v) => !v)) {
        return res.status(400).json({
            msg: 'Missing character fields'
        });
    }

    const db = readDb();
    const character = {
        character_id: db.nextIds.character++,
        user_id: req.user.user_id,
        character_name: String(character_name),
        character_race: String(character_race),
        character_class: String(character_class),
        character_build: String(character_build),
        character_level: String(character_level),
        character_sheet: String(character_sheet),
        character_image: String(character_image),
        created_date: new Date().toISOString(),
    };

    db.characters.push(character);
    writeDb(db);
    return res.json(character);
});

router.delete('/characters/:characterId', requireAuth, (req, res) => {
    const characterId = Number(req.params.characterId);

    const db = readDb();
    const before = db.characters.length;
    db.characters = db.characters.filter(
        (c) => !(c.character_id === characterId && c.user_id === req.user.user_id)
    );

    if (db.characters.length === before) {
        return res.status(404).json({
            msg: 'Character not found'
        });
    }

    writeDb(db);
    return res.json({
        msg: 'Deleted'
    });
});

module.exports = router;