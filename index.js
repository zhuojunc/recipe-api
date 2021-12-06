require("dotenv").config();

const express = require("express");
const {Client} = require("pg");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/recipes", (request, response) => {
    const client = createClient();
    client.connect().then(() => {
        client.query("SELECT * FROM recipes").then((queryResponse) => {
            response.json(queryResponse.rows);
            client.end();
        });
    })
});

app.get("/api/recipes/:id", (request, response) => {
    const client = createClient();
    client.connect().then(() => {
        client.query("SELECT * FROM recipes WHERE id = $1", [request.params.id]).then((queryResponse) => {
            response.json(queryResponse.rows[0]);
            client.end();
        });
    })
});

app.get("/api/bookmark", (request, response) => {
    const client = createClient();
    client.connect().then(() => {
        client.query("SELECT * FROM recipes WHERE bookmark").then((queryResponse) => {
            response.json(queryResponse.rows);
            client.end();
        });
    })
});

app.post("/api/category", (request, response) => {
    const client = createClient();
    client.connect().then(() => {
        client.query(`SELECT * FROM recipes WHERE category = '${request.body.category}'`).then((queryResponse) => {
            response.json(queryResponse.rows);
            client.end();
        });
    });
});

app.post("/api/recipes", (request, response) => {
    const client = createClient();
    client.connect().then(() => {
        client.query("INSERT INTO recipes (title, body, category, bookmark) VALUES ($1, $2, $3, $4) RETURNING *", [request.body.title, request.body.body, request.body.category, request.body.bookmark]).then((queryResponse) => {
            response.json(queryResponse.rows[0]);
            client.end();
        });
    });    
});

app.put("/api/recipes/:id", (request, response) => {
    const client = createClient();
  
    client.connect().then(() => {
      client
        .query(
          "UPDATE recipes SET title = $1, body = $2, category = $3 WHERE id = $4 RETURNING *",
          [request.body.title, request.body.body, request.body.category, request.params.id]
        )
        .then((queryResponse) => {
            response.json(queryResponse.rows[0]);
            client.end();
        });
    });
  });

  app.put("/api/bookmark/:id", (request, response) => {
    const client = createClient();
  
    client.connect().then(() => {
      client
        .query(
          `UPDATE recipes SET bookmark = true, bookmark_date = '${request.body.bookmark_date}' WHERE id = ${request.params.id} RETURNING *`
        )
        .then((queryResponse) => {
            response.json(queryResponse.rows[0]);
            client.end();
        });
    });
  });

  app.put("/api/unbookmark/:id", (request, response) => {
    const client = createClient();
  
    client.connect().then(() => {
      client
        .query(
          `UPDATE recipes SET bookmark = false, bookmark_date = null WHERE id = ${request.params.id} RETURNING *`
        )
        .then((queryResponse) => {
            response.json(queryResponse.rows[0]);
            client.end();
        });
    });
  });
  
  app.delete("/api/recipes/:id", (request, response) => {
    const client = createClient();
  
    client.connect().then(() => {
      client
        .query("DELETE FROM recipes WHERE id = $1", [request.params.id])
        .then((queryResponse) => {
          if (queryResponse.rowCount === 1) {
            response.status(204).send();
          } else {
            response.status(404).send();
          }
          client.end();
        });
    });
  });

function createClient() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    
    return client;
}

app.listen(process.env.PORT || 8000);