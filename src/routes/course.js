const express = require('express');
const router = express.Router();
const Course = require('../models/coursesData/course'); 
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { courseName, description, duration, batch, batchStartDate, topicsCovered } = req.body;

    const newCourse = new Course({
      courseName,
      description,
      duration,
      batch,
      batchStartDate,
      topicsCovered
    });

    await newCourse.save();

    res.status(201).send({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    res.status(400).send({ error: 'Error creating course', details: error });
  }
});

module.exports = router;
