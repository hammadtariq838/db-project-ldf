CREATE DATABASE ldf;

\c ldf;

CREATE EXTENSION "uuid-ossp";

CREATE TABLE users (
    userid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    picture TEXT,
    bio TEXT
);

CREATE TABLE posts (
    postid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    body TEXT,
    picture TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

select * from posts;

CREATE TABLE comments (
    commentid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postid UUID NOT NULL REFERENCES posts(postid) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parentid UUID REFERENCES comments(commentid) ON DELETE CASCADE DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
    postid UUID NOT NULL REFERENCES posts(postid) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    vote BOOLEAN DEFAULT NULL,
    PRIMARY KEY (postid, userid)
);


