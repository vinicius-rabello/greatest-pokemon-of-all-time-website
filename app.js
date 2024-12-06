const express = require('express');
const path = require('path');
const pool = require('./db/db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/pokemon', async (req, res) => {
    const { type = 'all', generation = 999} = req.query;
    try {
        const query = `
            SELECT ROW_NUMBER() OVER (ORDER BY greatness_metric DESC) AS rank, * FROM ranking
            WHERE (type_1 = $1 OR type_2 = $1 OR $1 = 'all')
            AND (gen = $2 OR $2 = 999)
            LIMIT 100;
        `;
        const values = [type, generation];
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});