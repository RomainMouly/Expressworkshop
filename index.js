const connection = require("./config");
const express = require("express");
const port = 3000;
const app = express();
const bodyParser = require("body-parser");

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (request, response) => {
  response.send("Welcome to the Simpsons character list");
});

// Recuperer tous les personnages
//characters :nom de la route choisi ici, on met le nom qu'on veut
// + Ordered data recovery dan sla meme requete

app.get("/api/characters", (req, res) => {
  let sql = "SELECT * FROM perso";
  sql +=
    req.query.sort === "asc" || req.query.sort === "desc"
      ? ` ORDER BY name ${req.query.sort}`
      : "";

  connection.query(sql, (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving data");
    } else {
      results.length === 0
        ? res.status(404).send("No character found")
        : res.status(200).json(results);
    }
  });
});

// Recuperer tous les personnages
//characters :nom de la route choisi ici, on met le nom qu'on veut
app.get("/api/characters", (req, res) => {
  connection.query("SELECT * FROM perso", (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving data");
    } else {
      results.length === 0
        ? res.status(404).send("No character found")
        : res.status(200).json(results);
    }
  });
});

//recuperer un personnages
// Retrieve specific fields (i.e. id, names, dates, etc.)
app.get("/api/characters/:id", (req, res) => {
  connection.query(
    "SELECT * FROM perso WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        results.length === 0
          ? res.status(404).send("no character found")
          : res.status(200).json(results[0]);
      }
    }
  );
});

// A filter for data that contains... (e.g. name containing the string 'wcs')
app.get("/api/characters/name/:contains", (req, res) => {
  connection.query(
    "SELECT * FROM perso WHERE name LIKE ?",
    [`%${req.params.contains}%`],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        results.length === 0
          ? res
              .status(404)
              .send(`No character with ${req.params.letter} in the name`)
          : res.status(200).json(results);
      }
    }
  );
});

//filtre : commence par...
app.get("/api/characters/name/start/:contains", (req, res) => {
  connection.query(
    "SELECT * FROM perso WHERE name LIKE ?",
    [`${req.params.contains}%`],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        results.length === 0
          ? res
              .status(404)
              .send(`No character begin with ${req.params.letter} in the name`)
          : res.status(200).json(results);
      }
    }
  );
});

// A filter for data that is greater than... (e.g. date greater than 18/10/2010)
app.get("/api/characters/height/min/:height", (req, res) => {
  connection.query(
    "SELECT * FROM perso WHERE height > ?",
    [req.params.height],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        results.length === 0
          ? res
              .status(404)
              .send(
                `No character has a height greater than ${req.params.height}cm`
              )
          : res.status(200).json(results);
      }
    }
  );
});

// Insertion of a new entity
app.post("/api/characters", (req, res) => {
  let { name, height, simpsons, quote, birthday } = req.body; // ce qu'on va rajouter dans la bd (qu'on va mettre dans le body)
  birthday = birthday.slice(0, 10); // optionnel : pour garder les 10 premiers element de la date

  connection.query(
    "INSERT INTO perso (name, height, simpsons, quote, birthday) VALUES (?, ?, ?, ?, ?)", //nom des champs de la bd
    [name, height, simpsons, quote, birthday],
    (err) => {
      if (err) {
        res.status(500).send("An error has occured.");
      } else {
        res.status(200).send("The Character has been added successfully");
      }
    }
  );
});

// Modification of an entity
app.put("/api/characters/:id", (req, res) => {
  const characterId = req.params.id;
  const newCharacter = req.body;

  connection.query(
    "UPDATE perso SET ? WHERE id = ?",
    [newCharacter, characterId],
    (err) => {
      if (err) {
        res.status(500).send("Error updating a movie");
      } else {
        res.status(200).send("The character has been updated successfully");
      }
    }
  );
});

// Delete all entities where boolean value is false
app.delete("/api/personnages/simpsons", (req, res) => {
  connection.query("DELETE FROM perso WHERE simpsons = 0", (err) => {
    if (err) {
      res.status(500).send("An error has occured.");
    } else {
      res.status(200).send("All no simspons characters have been removed");
    }
  });
});

// Delete an entity
app.delete("/api/personnages/:id", (req, res) => {
  connection.query("DELETE FROM perso WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      res.status(500).send("An error has occured.");
    } else {
      res.status(200).send("The character has been deleted successfully");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is runing on 3000`);
});
