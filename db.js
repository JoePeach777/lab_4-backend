const Database = require('better-sqlite3');
const db = new Database('lab4.db');

// 1. Создание таблицы (CREATE TABLE)
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    duration INTEGER,
    price REAL,
    level TEXT DEFAULT 'Начальный'
  )
`);
console.log('1. Таблица courses создана.');

// Очищаем таблицу перед запуском, чтобы при повторных тестах данные не дублировались
db.exec('DELETE FROM courses');
db.exec("DELETE FROM sqlite_sequence WHERE name='courses'");

// 2. Вставка данных (INSERT - минимум 5 записей, берём 7 для наглядной пагинации и группировки)
const insert = db.prepare(`
  INSERT INTO courses (title, duration, price, level) 
  VALUES (?, ?, ?, ?)
`);

const initialCourses = [
  ['Основы JavaScript', 40, 15000, 'Начальный'],
  ['Backend на Node.js', 60, 28000, 'Средний'],
  ['Алгоритмы и структуры данных', 80, 35000, 'Продвинутый'],
  ['HTML и CSS с нуля', 25, 9000, 'Начальный'],
  ['Базы данных и SQL', 45, 22000, 'Средний'],
  ['Архитектура микросервисов', 90, 45000, 'Продвинутый'],
  ['Git и командная разработка', 15, 7000, 'Начальный']
];

for (const course of initialCourses) {
  insert.run(...course);
}
console.log('\n2. Данные успешно вставлены (7 курсов).');

// 3. Выборка всех записей (SELECT *)
console.log('\n--- 3. Все курсы (SELECT *) ---');
console.table(db.prepare('SELECT * FROM courses').all());

// 4. Фильтрация по одному полю (SELECT с WHERE)
console.log('\n--- 4. Курсы дороже 20 000 руб. (WHERE price > 20000) ---');
console.table(db.prepare('SELECT * FROM courses WHERE price > ?').all(20000));

// 5. Обновление одной записи (UPDATE)
db.prepare('UPDATE courses SET price = ? WHERE id = ?').run(16500, 1);
console.log('\n--- 5. Обновлена цена курса с id=1 (UPDATE) ---');
console.table(db.prepare('SELECT * FROM courses WHERE id = 1').all());

// 6. Удаление одной записи (DELETE)
db.prepare('DELETE FROM courses WHERE id = ?').run(7);
console.log('\n--- 6. Удалён курс с id=7 (DELETE) ---');
console.table(db.prepare('SELECT * FROM courses').all());



// 7. Сортировка по возрастанию и убыванию (ORDER BY по title и price)
console.log('\n--- 7.1. Сортировка по названию по возрастанию (ORDER BY title ASC) ---');
console.table(db.prepare('SELECT * FROM courses ORDER BY title ASC').all());

console.log('\n--- 7.2. Сортировка по цене по убыванию (ORDER BY price DESC) ---');
console.table(db.prepare('SELECT * FROM courses ORDER BY price DESC').all());

// 8. Пагинация: 2 страницы по 3 записи (LIMIT и OFFSET)
console.log('\n--- 8.1. Пагинация: Страница 1 (LIMIT 3 OFFSET 0) ---');
console.table(db.prepare('SELECT * FROM courses LIMIT 3 OFFSET 0').all());

console.log('\n--- 8.2. Пагинация: Страница 2 (LIMIT 3 OFFSET 3) ---');
console.table(db.prepare('SELECT * FROM courses LIMIT 3 OFFSET 3').all());

// 9. Поиск по подстроке (LIKE)
console.log('\n--- 9. Поиск курсов со словом "и" в названии (LIKE) ---');
console.table(db.prepare('SELECT * FROM courses WHERE title LIKE ?').all('%и%'));

// 10. Выбор в диапазоне (BETWEEN)
console.log('\n--- 10. Курсы длительностью от 40 до 80 часов (BETWEEN) ---');
console.table(db.prepare('SELECT * FROM courses WHERE duration BETWEEN ? AND ?').all(40, 80));

// 11. Выбор из списка значений (IN)
console.log('\n--- 11. Курсы уровней Начальный и Продвинутый (IN) ---');
console.table(db.prepare("SELECT * FROM courses WHERE level IN ('Начальный', 'Продвинутый')").all());

// 12. Агрегатные функции (COUNT, AVG, MAX, MIN, SUM)
console.log('\n--- 12. Общая статистика по курсам (Агрегатные функции) ---');
const stats = db.prepare(`
  SELECT 
    COUNT(*) AS total_courses,
    SUM(duration) AS total_hours,
    ROUND(AVG(price), 2) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
  FROM courses
`).get();
console.table([stats]);

// 13. Группировка по полю level (GROUP BY)
console.log('\n--- 13. Статистика по уровням сложности (GROUP BY level) ---');
const grouped = db.prepare(`
  SELECT 
    level,
    COUNT(*) AS courses_count,
    ROUND(AVG(price), 2) AS avg_price,
    SUM(duration) AS total_duration
  FROM courses
  GROUP BY level
`).all();
console.table(grouped);

db.close();