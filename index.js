const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
// const { MongoClient, ObjectId } = require("mongodb").MongoClient;
const colors = require("colors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

// dotenv.config({
//   path: "",
// });

const url =
  "mongodb+srv://mishrayash:uMZn4XIs2DW4y4oA@dtassignment.8pviytr.mongodb.net/dtassignment?retryWrites=true&w=majority";

const port = 5000;

MongoClient.connect(url)
  .then((client) => {
    console.log("connected to mongodb server");

    const db = client.db("dtassignment");
    const backend = db.collection("backendassignment");

    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("database conected!".red);
    });

    // save lesson into collection
    app.post("/api/v3/app/events", (req, res) => {
      backend
        .insertOne(req.body)
        .then((result) => {
          res.status(201).json({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            message: error.message,
          });
        });
    });

    // get all backend from collection
    app.get("/api/v3/app/events", async (req, res) => {
      const queryLength = Object.keys(req.query).length;
      if (queryLength === 1) {
        try {
          const filter = { _id: new ObjectId(req.query.id) };
          const event = await backend.findOne(filter);
          if (!event) {
            return res.status(404).json({ error: "Event not found" });
          }
          res.status(200).json(event);
        } catch (err) {
          console.log(err);
          res.status(500).send({
            error: "No record with given _id : " + req.query.id,
          });
        }
      } else if (queryLength > 1) {
        try {
          const { type, limit, page } = req.query;
          const query = {};
          if (type) {
            query.type = type;
            console.log(type);
          }
          if (limit) {
            const parsedLimit = parseInt(limit);
            query.limit = isNaN(parsedLimit) ? 0 : parsedLimit;
          }
          if (page) {
            const parsedPage = parseInt(page);
            query.page = isNaN(parsedPage) ? 1 : parsedPage;
          }
          console.log(query);
          const events = await backend.find(query).toArray();
          res.json(events);
        } catch (err) {
          console.log(err);
          res.status(404).json({
            error: "No record with given _id : " + req.params.id,
          });
        }
      }
    });

    //get by id through by link type,limit,page
    // app.get("/api/v3/app/events", async (req, res) => {
    //   try {
    //     const { type } = req.query;
    //     const query = {};
    //     if (type) {
    //       query.type = type;
    //       console.log(type);
    //     }
    //     // if (limit) {
    //     //   const parsedLimit = parseInt(limit);
    //     //   query.limit = isNaN(parsedLimit) ? 0 : parsedLimit;
    //     // }
    //     // if (page) {
    //     //   const parsedPage = parseInt(page);
    //     //   query.page = isNaN(parsedPage) ? 1 : parsedPage;
    //     // }
    //     const events = await backend.find(query).toArray();
    //     // let page = Number(req.query.page) || 1
    //     // let limit = req.query.limit || 3
    //     // //pagination formula
    //     // let skip = (page - 1) * limit
    //     // if (req.query.limit) {
    //     //   apiData = apiData.skip(skip).limit(limit)
    //     // }

    //     res.json(events);
    //   } catch (err) {
    //     console.log(err);
    //     res.status(404).json({
    //       error: "No record with given _id : " + req.params.id,
    //     });
    //   }
    // });

    // udpate on lesson
    app.put("/api/v3/app/events/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params.id) };
        const update = { $set: req.body };
        const result = await backend.updateOne(filter, update);
        res.status(200).send(result);
      } catch (err) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // delete a lesson
    app.delete("/api/v3/app/events/:id", (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      backend
        .deleteOne(filter)
        .then((result) => {
          res.status(200).json({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            message: error.message,
          });
        });
    });

    app.listen(port, () => console.log("listening on port " + port));
  })
  .catch(console.error);
