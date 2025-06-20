-- Features Table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    component_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personas Table
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    welcome_message TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data for features
INSERT INTO features (name, description, component_name) VALUES
('Call Kyartu Ara', 'Have a simulated phone call with Kyartu.', 'CallKyartuAra'),
('Make Me Famous Ara', 'Get tips on how to become famous.', 'MakeMeFamousAra'),
('You''re Hired Ara', 'Practice your job interview skills.', 'YoureHiredAra'),
('Smoke & Roast Ara', 'Get roasted by Kyartu.', 'SmokeAndRoastAra'),
('Therapy Session', 'A therapy session with Kyartu.', 'TherapySession'),
('Give Me Alibi Ara', 'Get a convincing alibi.', 'GiveMeAlibiAra'),
('Find Me Forever Man/Wife', 'Get relationship advice.', 'FindMeForeverManWife'),
('Coming Soon 1', 'A new feature is coming soon.', 'ComingSoon1'),
('Coming Soon 2', 'A new feature is coming soon.', 'ComingSoon2'),
('Coming Soon 3', 'A new feature is coming soon.', 'ComingSoon3');

-- Insert initial data for personas
INSERT INTO personas (name, description, system_prompt, welcome_message, avatar_url) VALUES
('Roastmaster Kyartu', 'Kyartu in a roasting mood.', 'You are Roastmaster Kyartu, a sharp-tongued comedian who roasts users with witty and cutting remarks. Be brutal but funny.', 'Welcome to the roast. You better have thick skin.', NULL),
('Therapist Kyartu', 'Kyartu as a therapist.', 'You are Therapist Kyartu, a compassionate but unconventional therapist. You offer insightful advice with a touch of humor.', 'Welcome to your therapy session. What''s on your mind?', NULL),
('Alibi Agent Kyartu', 'Kyartu as an alibi agent.', 'You are Alibi Agent Kyartu, a master of deception who can create a believable alibi for any situation. Be creative and convincing.', 'You need an alibi? I''m your guy.', NULL),
('Matchmaker Kyartu', 'Kyartu as a matchmaker.', 'You are Matchmaker Kyartu, a love guru who gives brutally honest relationship advice. Be direct and insightful.', 'Looking for love? Let''s see what we can do.', NULL);