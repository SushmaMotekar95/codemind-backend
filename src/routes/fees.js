const express = require('express');
const router = express.Router();
const Course = require('../models/coursesData/fees');

// POST API to add new course and its total fees
router.post('/', async (req, res) => {
  try {
    const { name, totalFees } = req.body;

    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).send({ message: 'Course already exists' });
    }

    // Create a new course
    const newCourse = new Course({ name, totalFees });

    // Save the course in the database
    await newCourse.save();

    return res.status(201).send({ message: 'Course added successfully', course: newCourse });
  } catch (error) {
    return res.status(500).send({ error: 'Error saving course', details: error.message });
  }
});

// GET API to retrieve all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find(); 
    return res.status(200).send(courses);
  } catch (error) {
    return res.status(500).send({ error: 'Error retrieving courses', details: error.message });
  }
});

// GET API to retrieve a specific course by name
router.get('/course/:name', async (req, res) => {
  try {
    const courseName = req.params.name;
    const course = await Course.findOne({ name: courseName }); 

    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    return res.status(200).send(course);
  } catch (error) {
    return res.status(500).send({ error: 'Error retrieving course', details: error.message });
  }
});

module.exports = router;
