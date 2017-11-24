--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Users (
  id       INTEGER PRIMARY KEY,
  name     TEXT    NOT NULL,
  email    TEXT    NOT NULL,
  password TEXT    NOT NULL
);

CREATE TABLE Tweets (
  id        INTEGER PRIMARY KEY,
  userId    INTEGER NOT NULL,
  createAt  TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT Tweets_fk_userId FOREIGN KEY (userId)
    REFERENCES Users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX Tweets_ix_userId ON Tweets (userId);
--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX Tweets_ix_userId;
DROP TABLE Tweets;
DROP TABLE Users;
