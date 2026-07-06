const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4321;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SEED = {
  posts: [
    {
      id: 'seed-1',
      title: 'Why Payload CMS Won Me Over',
      topic: 'Code',
      contentType: 'Case Study',
      status: 'drafting',
      scheduledDate: null,
      subjects: ['payload', 'cms', 'nextjs'],
      notes: 'Walk through the decision process vs Strapi/Sanity. Include config snippets.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'seed-2',
      title: 'The Quiet Death of the Mid-Budget Movie',
      topic: 'Movies',
      contentType: 'Article',
      status: 'idea',
      scheduledDate: null,
      subjects: ['hollywood', 'streaming', 'economics of film'],
      notes: 'Long-form. Where did the $40M drama go?',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'seed-3',
      title: 'Six TV Finales That Stuck the Landing',
      topic: 'TV',
      contentType: 'Listicle',
      status: 'idea',
      scheduledDate: null,
      subjects: ['finales', 'prestige tv'],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      saveData(SEED);
      return JSON.parse(JSON.stringify(SEED));
    }
    throw err;
  }
}

function saveData(data) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

const TOPICS = ['Code', 'Tech', 'Opinion', 'Sports', 'TV', 'Movies', 'Literature'];
const CONTENT_TYPES = ['Article', 'Listicle', 'Review', 'News', 'Case Study', 'Interview'];
const STATUSES = ['idea', 'drafting', 'scheduled', 'published'];

function validatePost(body, partial = false) {
  const errors = [];
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.push('title is required');
  }
  if (!partial || has('topic')) {
    if (!TOPICS.includes(body.topic)) errors.push(`topic must be one of: ${TOPICS.join(', ')}`);
  }
  if (!partial || has('contentType')) {
    if (!CONTENT_TYPES.includes(body.contentType)) errors.push(`contentType must be one of: ${CONTENT_TYPES.join(', ')}`);
  }
  if (has('status') && !STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }
  if (has('scheduledDate') && body.scheduledDate !== null && body.scheduledDate !== '') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.scheduledDate)) errors.push('scheduledDate must be YYYY-MM-DD or null');
  }
  if (has('subjects') && !Array.isArray(body.subjects)) {
    errors.push('subjects must be an array of strings');
  }
  return errors;
}

app.get('/api/meta', (req, res) => {
  res.json({ topics: TOPICS, contentTypes: CONTENT_TYPES, statuses: STATUSES });
});

app.get('/api/posts', (req, res) => {
  res.json(loadData().posts);
});

app.post('/api/posts', (req, res) => {
  const errors = validatePost(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const data = loadData();
  const now = new Date().toISOString();
  const post = {
    id: crypto.randomUUID(),
    title: req.body.title.trim(),
    topic: req.body.topic,
    contentType: req.body.contentType,
    status: STATUSES.includes(req.body.status) ? req.body.status : 'idea',
    scheduledDate: req.body.scheduledDate || null,
    subjects: (req.body.subjects || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean),
    notes: typeof req.body.notes === 'string' ? req.body.notes : '',
    createdAt: now,
    updatedAt: now
  };
  data.posts.push(post);
  saveData(data);
  res.status(201).json(post);
});

app.put('/api/posts/:id', (req, res) => {
  const errors = validatePost(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  const data = loadData();
  const post = data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'not found' });

  const b = req.body;
  if (b.title !== undefined) post.title = b.title.trim();
  if (b.topic !== undefined) post.topic = b.topic;
  if (b.contentType !== undefined) post.contentType = b.contentType;
  if (b.status !== undefined) post.status = b.status;
  if (b.scheduledDate !== undefined) post.scheduledDate = b.scheduledDate || null;
  if (b.subjects !== undefined) post.subjects = b.subjects.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  if (b.notes !== undefined) post.notes = String(b.notes);
  post.updatedAt = new Date().toISOString();

  saveData(data);
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const data = loadData();
  const idx = data.posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const [removed] = data.posts.splice(idx, 1);
  saveData(data);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Scrumtrulescent planner running at http://localhost:${PORT}`);
});
