CREATE TABLE professors (
    professor_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    number_of_members INT NOT NULL,
    professor_id INT NOT NULL,
    mean_score FLOAT,
    variance FLOAT,
    FOREIGN KEY (professor_id) REFERENCES professors(professor_id)
);
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE session_students (
    session_id INT,
    student_id INT,
    score FLOAT NOT NULL,
    PRIMARY KEY (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    session_id INT,
    question_text TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
CREATE TABLE ai_agents (
    agent_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL
);

CREATE TABLE session_ai_agents (
    session_id INT,
    agent_id INT,
    PRIMARY KEY (session_id, agent_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (agent_id) REFERENCES ai_agents(agent_id)
);
