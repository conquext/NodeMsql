const express = require("express"),
  path = require("path"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  mysql = require("mysql"),
  dotenv = require("dotenv");
myConnection = require("express-myconnection");

dotenv.config();

const app = express();

const table = process.env.DB_TABLE || "table";

// settings
app.set("port", process.env.PORT || 3003);

// middlewares
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  myConnection(
    mysql,
    {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "password",
      port: 3306,
      database: process.env.DB_NAME || "test",
    },
    "single"
  )
);

app.use(express.urlencoded({ extended: false }));

// routes
app.use("/listdata", (req, res) => {
  req.getConnection((err, conn) => {
    conn.query(`SELECT * FROM ${table}`, (err, data) => {
      if (err) {
        res.json(err);
      }
      res.json({
        data,
      });
    });
  });
});

app.use("/savedata", (req, res) => {
  const data = req.body;
  console.log(req.body);
  req.getConnection((err, connection) => {
    const query = connection.query(
      `INSERT INTO ${table} set ?`,
      data,
      (err, result) => {
        res.json({ data: result });
      }
    );
  });
});

app.use("/editdata", (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, rows) => {
      res.json({
        data: rows[0],
      });
    });
  });
});

app.use("/updatedata", (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  req.getConnection((err, conn) => {
    conn.query(
      `UPDATE ${table} set ? where id = ?`,
      [newData, id],
      (err, rows) => {
        res.json({
          data: rows[0],
        });
      }
    );
  });
});

app.use("/deletedata", (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, rows) => {
      res.json({ msg: "deleted successfully" });
    });
  });
});
// static files
app.use(express.static(path.join(__dirname, "../public")));

// starting the server
app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
