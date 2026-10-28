const fs = require('fs');
const path = require('path');
const os = require('os');
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Isolate test database in a temporary file so WAL & all pragmas run faithfully
const tmpDbPath = path.join(
  os.tmpdir(),
  `vphlabs-test-${process.pid}-${Date.now()}.db`
);
process.env.SQLITE_DB_PATH = tmpDbPath;
process.env.NODE_ENV = 'test';

const env = require('../src/config/env');
const { closeDb } = require('../src/connection/db');
const { runMigrations } = require('../src/migrations/runner');
const { seedDatabase } = require('../src/seeds/seed');
const userRepository = require('../src/repositories/userRepository');
const { createApp } = require('../src/app');

let app;
let adminToken;
let viewerToken;

test.before(() => {
  const mig = runMigrations();
  assert.equal(mig.total, 4);
  seedDatabase();
  app = createApp();

  const adminUser = userRepository.findByEmailWithHash(env.seedAdminEmail);
  adminToken = jwt.sign(
    { sub: adminUser.id, email: adminUser.email, role: adminUser.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  );

  // Create a viewer user to test requireRole('admin') 403 enforcement
  const viewerUser = userRepository.create({
    name: 'کاربر مشاهده‌گر',
    email: 'viewer@vphlabs.com',
    password_hash: bcrypt.hashSync('ViewerPass123!', 10),
    role: 'viewer',
  });
  viewerToken = jwt.sign(
    { sub: viewerUser.id, email: viewerUser.email, role: viewerUser.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  );
});

test.after(() => {
  closeDb();
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(tmpDbPath + suffix)) {
      fs.unlinkSync(tmpDbPath + suffix);
    }
  }
});

test('Architecture Guardrail: Controllers never import db.js or better-sqlite3 directly', () => {
  const controllersDir = path.resolve(__dirname, '../src/controllers');
  const files = fs.readdirSync(controllersDir).filter((f) => f.endsWith('.js'));
  assert.ok(files.length >= 8);

  for (const file of files) {
    const src = fs.readFileSync(path.join(controllersDir, file), 'utf8');
    assert.ok(
      !src.includes('connection/db') && !src.includes('better-sqlite3'),
      `Controller ${file} must use repositories instead of touching db directly`
    );
  }
});

test('Migration Runner: Idempotent re-run applies 0 duplicate migrations', () => {
  const secondRun = runMigrations();
  assert.equal(secondRun.applied.length, 0);
  assert.equal(secondRun.total, 4);
});

test('Seed Admin Sync: Re-syncs stale persistent-disk admin username & password on startup', () => {
  const currentAdmin = userRepository.findByEmailWithHash(env.seedAdminEmail);
  assert.ok(currentAdmin);

  // Simulate an older persistent SQLite disk where admin had a stale username & password
  userRepository.updateCredentials(currentAdmin.id, {
    email: 'old-admin@example.com',
    password_hash: bcrypt.hashSync('OldStalePassword!123', 10),
  });
  assert.equal(userRepository.findByEmailWithHash(env.seedAdminEmail), null);

  // Running seedDatabase() on container boot must migrate & sync credentials automatically
  seedDatabase();

  const syncedAdmin = userRepository.findByEmailWithHash(env.seedAdminEmail);
  assert.ok(syncedAdmin);
  assert.equal(syncedAdmin.id, currentAdmin.id);
  assert.equal(syncedAdmin.email, 'VPHAdmin');
  assert.equal(
    bcrypt.compareSync(env.seedAdminPassword, syncedAdmin.password_hash),
    true
  );
});

test('GET /api/health returns database connection & applied migrations status', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'ok');
  assert.equal(res.body.data.database, 'connected');
  assert.equal(res.body.data.migrationsCount, 4);
});

test('GET /api/content/bootstrap returns charter services, charter banners, team members & updated contact info', async () => {
  const res = await request(app).get('/api/content/bootstrap').expect(200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.banners.length, 3);
  assert.ok(res.body.data.banners[0].title_fa.length > 10);
  assert.equal(res.body.data.services.length, 12);
  assert.equal(res.body.data.teamMembers.length, 3);
  assert.equal(res.body.data.contents['company.reg_number'].en, '3545');
  assert.equal(res.body.data.contents['company.national_id'], undefined);
  assert.equal(res.body.data.contents['company.mechanized_no'], undefined);
  assert.equal(res.body.data.contents['contact.phone'].fa, '0912 576 2296');
  assert.equal(res.body.data.contents['contact.postal_code'].fa, '6571611860');
  assert.ok(
    res.body.data.contents['contact.address_fa'].fa.includes('خیابان سعدی')
  );
});

test('Team CRUD & Bearer-first Auth: Admin can manage colleagues with LinkedIn & Instagram even if stale cookie exists', async () => {
  const created = await request(app)
    .post('/api/team')
    .set('Cookie', 'vph_token=stale-invalid-cookie-value')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      full_name_fa: 'مهندس مریم کاظمی',
      role_fa: 'متخصص پردازش زبان طبیعی فارسی',
      bio_fa: 'پژوهشگر مدل‌های زبانی بزرگ و سیستم‌های بازیابی دانش سازمانی.',
      linkedin_url: 'https://www.linkedin.com/in/maryam-kazemi',
      instagram_url: 'https://www.instagram.com/maryam.kazemi.ai',
      sort_order: 5,
      is_active: true,
    })
    .expect(201);

  assert.equal(created.body.data.full_name_fa, 'مهندس مریم کاظمی');
  assert.equal(
    created.body.data.linkedin_url,
    'https://www.linkedin.com/in/maryam-kazemi'
  );

  const updated = await request(app)
    .put(`/api/team/${created.body.data.id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ role_fa: 'سرپرست آزمایشگاه NLP' })
    .expect(200);
  assert.equal(updated.body.data.role_fa, 'سرپرست آزمایشگاه NLP');

  await request(app)
    .delete(`/api/team/${created.body.data.id}`)
    .set('X-VPH-Auth', adminToken)
    .expect(200);

  // Verify fallback when intermediate proxy strips Authorization & X-VPH-Auth and blocks cookies
  await request(app)
    .get(`/api/admin/stats?_vph_auth=${encodeURIComponent(adminToken)}`)
    .expect(200);
});

test('GET /api/products supports pagination, sorting, and SQL LIKE search', async () => {
  const pageRes = await request(app)
    .get('/api/products?page=1&limit=2&sortBy=sort_order&order=asc')
    .expect(200);

  assert.equal(pageRes.body.data.length, 2);
  assert.equal(pageRes.body.pagination.total, 6);
  assert.equal(pageRes.body.pagination.totalPages, 3);
  assert.equal(pageRes.body.data[0].slug, 'vira-docmind-ai');

  const searchRes = await request(app)
    .get(`/api/products?q=${encodeURIComponent('اتوگارد')}`)
    .expect(200);
  assert.equal(searchRes.body.data.length, 1);
  assert.equal(searchRes.body.data[0].slug, 'vira-autoguard-industrial');

  await request(app).get('/api/products/non-existent-slug').expect(404);
});

test('GET /api/articles, view counter, like button & SEO sitemap/robots work', async () => {
  const listRes = await request(app).get('/api/articles?page=1&limit=3').expect(200);
  assert.equal(listRes.body.data.length, 3);
  assert.ok(Array.isArray(listRes.body.categories));

  const detailRes = await request(app)
    .get('/api/articles/enterprise-rag-architecture-iran')
    .expect(200);
  const initialLikes = detailRes.body.data.likes_count;

  const likeRes = await request(app)
    .post('/api/articles/enterprise-rag-architecture-iran/like')
    .expect(200);
  assert.equal(likeRes.body.data.likes_count, initialLikes + 1);

  const sitemapRes = await request(app).get('/sitemap.xml').expect(200);
  assert.match(sitemapRes.headers['content-type'], /xml/);
  assert.ok(sitemapRes.text.includes('enterprise-rag-architecture-iran'));

  const robotsRes = await request(app).get('/robots.txt').expect(200);
  assert.ok(robotsRes.text.includes('Disallow: /admin'));
});

test('GET /api/search runs unified SQL LIKE search across products and articles', async () => {
  const res = await request(app)
    .get(`/api/search?q=${encodeURIComponent('اتوماسیون')}`)
    .expect(200);
  assert.ok(res.body.data.products.length >= 1);
  assert.ok(res.body.data.articles.length >= 1);
});

test('POST /api/contacts validates with Zod, normalizes Persian phone digits & sanitizes XSS', async () => {
  await request(app)
    .post('/api/contacts')
    .send({ full_name: 'الف', email: 'bad-email', phone: '123', subject: 'x', message: 'short' })
    .expect(400);

  const validRes = await request(app)
    .post('/api/contacts')
    .send({
      full_name: 'مهندس علی رضایی',
      organization: 'سازمان فناوری اطلاعات استان همدان',
      email: 'rezaei@example.ir',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      subject: 'درخواست پایلوت ویرا داک‌مایند',
      department: 'ai-consulting',
      message: 'سلام، لطفاً شرایط استقرار بومی سامانه را ارسال فرمایید. <script>alert(1)</script>',
    })
    .expect(201);

  assert.equal(validRes.body.success, true);

  // Verify stored message stripped <script> tag
  const adminList = await request(app)
    .get('/api/contacts')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  const saved = adminList.body.data.find((m) => m.email === 'rezaei@example.ir');
  assert.ok(saved);
  assert.ok(!saved.message.includes('<script>'));
  assert.equal(saved.phone, '09123456789');
});

test('RBAC: requireAuth (401) and requireRole("admin") (403) protect CMS mutations', async () => {
  await request(app)
    .post('/api/products')
    .send({ title_fa: 'تست' })
    .expect(401);

  await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${viewerToken}`)
    .send({
      slug: 'unauthorized-prod',
      title_fa: 'محصول غیرمجاز',
      summary_fa: 'خلاصه تستی برای بررسی عدم دسترسی نقش مشاهده‌گر',
      description_fa: 'توضیحات کامل تستی برای بررسی عدم دسترسی نقش مشاهده‌گر در سیستم.',
    })
    .expect(403);

  const createdRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      slug: 'vira-speech-analytics',
      title_fa: 'ویرا آوا (تحلیل هوشمند گفتار فارسی)',
      title_en: 'VIRA Ava Speech Analytics',
      summary_fa: 'تبدیل گفتار به متن جلسات رسمی و مراکز تماس سازمانی با دقت بالا.',
      description_fa: 'سامانه بومی تبدیل گفتار به متن فارسی ویژه صورت‌جلسات هیئت‌مدیره و مراکز تماس.',
      category: 'enterprise-ai',
      features: ['تشخیص گوینده', 'استقرار آفلاین'],
      target_sector: 'enterprise',
    })
    .expect(201);

  const createdId = createdRes.body.data.id;

  const updatedRes = await request(app)
    .put(`/api/products/${createdId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ badge: 'جدید' })
    .expect(200);
  assert.equal(updatedRes.body.data.badge, 'جدید');

  await request(app)
    .delete(`/api/products/${createdId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
});

test('Multer Upload: Accepts valid PNG magic bytes and rejects spoofed files', async () => {
  // Valid minimal 1x1 PNG buffer
  const validPng = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
    'hex'
  );

  const upRes = await request(app)
    .post('/api/uploads')
    .set('Authorization', `Bearer ${adminToken}`)
    .attach('file', validPng, { filename: 'test.png', contentType: 'image/png' })
    .expect(201);

  assert.match(upRes.body.data.public_url, /^\/uploads\/.*\.png$/);

  // Clean up test uploaded file
  const diskFile = path.resolve(
    __dirname,
    '../uploads',
    upRes.body.data.stored_name
  );
  if (fs.existsSync(diskFile)) {
    fs.unlinkSync(diskFile);
  }

  // Spoofed text buffer pretending to be image/png
  const spoofed = Buffer.from('not-an-actual-png-header-at-all');
  await request(app)
    .post('/api/uploads')
    .set('Authorization', `Bearer ${adminToken}`)
    .attach('file', spoofed, { filename: 'evil.png', contentType: 'image/png' })
    .expect(400);
});

test('Auth Login sets httpOnly SameSite=Lax cookie & enforces 5 req/min rate limit', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: env.seedAdminEmail,
      password: env.seedAdminPassword,
    })
    .expect(200);

  const setCookie = loginRes.headers['set-cookie']?.[0] || '';
  assert.match(setCookie, /vph_token=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);

  // Exhaust remaining 4 requests in the 5 req/min window, then verify 6th returns 429
  for (let i = 0; i < 4; i += 1) {
    await request(app)
      .post('/api/auth/login')
      .send({ email: env.seedAdminEmail, password: 'wrongpassword' });
  }

  const rateLimited = await request(app)
    .post('/api/auth/login')
    .send({ email: env.seedAdminEmail, password: 'wrongpassword' })
    .expect(429);

  assert.equal(rateLimited.body.error.code, 'TOO_MANY_AUTH_REQUESTS');
});
