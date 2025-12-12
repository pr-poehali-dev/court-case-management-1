-- СПРАВОЧНИКИ (Dictionaries)

-- Приоритеты задач
CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    color_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Типы задач
CREATE TABLE task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_duration INTEGER, -- в днях
    possible_outcomes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ПОЛЬЗОВАТЕЛИ (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('администратор', 'партнер', 'старший юрист', 'юрист', 'ассистент', 'менеджер')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- КЛИЕНТЫ (Clients)
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('физическое', 'юридическое')),
    full_name VARCHAR(255), -- для физлиц
    company_name VARCHAR(255), -- для юрлиц
    contact_info JSONB, -- {phones: [], emails: []}
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Физическое лицо
    passport_series_number VARCHAR(20),
    date_of_birth DATE,
    
    -- Юридическое лицо
    inn VARCHAR(20),
    kpp VARCHAR(20),
    ogrn VARCHAR(20),
    legal_address TEXT,
    
    CONSTRAINT check_client_type CHECK (
        (type = 'физическое' AND full_name IS NOT NULL) OR
        (type = 'юридическое' AND company_name IS NOT NULL)
    )
);

-- ШАБЛОНЫ ДЕЛ (Case Templates)
CREATE TABLE case_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ШАБЛОНЫ ЗАДАЧ (Task Templates)
CREATE TABLE task_templates (
    id SERIAL PRIMARY KEY,
    case_template_id INTEGER REFERENCES case_templates(id) ON UPDATE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stage VARCHAR(100),
    order_num INTEGER NOT NULL,
    task_type_id INTEGER REFERENCES task_types(id),
    default_priority_id INTEGER REFERENCES priorities(id),
    default_due_date_offset INTEGER, -- смещение в днях от даты открытия дела
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ДЕЛА (Cases)
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    internal_number VARCHAR(50) UNIQUE NOT NULL,
    external_number VARCHAR(100), -- номер дела в суде
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('открыто', 'в работе', 'на паузе', 'завершено', 'архив')),
    type VARCHAR(100) NOT NULL, -- судебное/досудебное/консультационное
    client_id INTEGER REFERENCES clients(id),
    responsible_user_id INTEGER REFERENCES users(id),
    template_id INTEGER REFERENCES case_templates(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- ЗАДАЧИ (Tasks)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    actual_date TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('новая', 'в работе', 'на проверке', 'выполнена', 'просрочена')),
    case_id INTEGER REFERENCES cases(id) ON UPDATE CASCADE,
    type_id INTEGER REFERENCES task_types(id),
    priority_id INTEGER REFERENCES priorities(id),
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    result_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ДОКУМЕНТЫ (Documents)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL, -- путь к файлу в S3
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size BIGINT,
    description TEXT,
    case_id INTEGER REFERENCES cases(id),
    task_id INTEGER REFERENCES tasks(id),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    category VARCHAR(100) CHECK (category IN ('иск', 'ответ', 'доказательство', 'претензия', 'внутренний документ', 'прочее'))
);

-- СОБЫТИЯ / ЗАСЕДАНИЯ (Hearings/Events)
CREATE TABLE hearings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    location TEXT,
    type VARCHAR(50) CHECK (type IN ('заседание', 'телефонный звонок', 'встреча', 'онлайн встреча')),
    description TEXT,
    outcome TEXT,
    case_id INTEGER REFERENCES cases(id) ON UPDATE CASCADE,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ИСТОРИЯ СТАТУСОВ ДЕЛ (Case Status History)
CREATE TABLE case_status_history (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON UPDATE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- ИЗДЕРЖКИ (Expenses)
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON UPDATE CASCADE,
    type VARCHAR(100) NOT NULL, -- госпошлина, экспертиза, доверенность и т.д.
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    document_id INTEGER REFERENCES documents(id),
    status VARCHAR(50) CHECK (status IN ('планируемые', 'фактические', 'возмещенные')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ОПЛАТЫ (Payments)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON UPDATE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    purpose TEXT,
    document_number VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('ожидается', 'получено', 'возврат')),
    invoice_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ИНДЕКСЫ для оптимизации запросов
CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_responsible_user ON cases(responsible_user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_tasks_case ON tasks(case_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_hearings_case ON hearings(case_id);
CREATE INDEX idx_hearings_datetime ON hearings(datetime);
CREATE INDEX idx_expenses_case ON expenses(case_id);
CREATE INDEX idx_payments_case ON payments(case_id);

-- Вставка базовых приоритетов
INSERT INTO priorities (name, level, color_code) VALUES
    ('Критический', 4, '#ef4444'),
    ('Высокий', 3, '#f97316'),
    ('Средний', 2, '#eab308'),
    ('Низкий', 1, '#22c55e');

-- Вставка базовых типов задач
INSERT INTO task_types (name, description, default_duration) VALUES
    ('Подача иска', 'Подготовка и подача искового заявления в суд', 7),
    ('Запрос документов', 'Запрос необходимых документов у клиента или третьих лиц', 3),
    ('Подготовка претензии', 'Составление досудебной претензии', 5),
    ('Встреча с клиентом', 'Личная или онлайн встреча с клиентом', 1),
    ('Анализ судебной практики', 'Изучение релевантных судебных решений', 5),
    ('Написание процессуального документа', 'Подготовка процессуальных документов', 3),
    ('Судебное заседание', 'Участие в судебном заседании', 1),
    ('Подготовка к заседанию', 'Подготовка документов и позиции к заседанию', 3);