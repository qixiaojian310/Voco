USE voco;
DELETE w
FROM voco.words w
JOIN (
    SELECT word, MIN(word_id) AS word_id
    FROM voco.words
    GROUP BY word
    HAVING COUNT(*) > 1
) dup ON w.word = dup.word
WHERE w.etymology IS NULL AND w.word_id != dup.word_id;
