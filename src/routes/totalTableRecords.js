const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Student = require('../models/Inquiry'); 
const NotInterested = require('../models/notInterested');
const Interested = require('../models/interested');
const FollowUp = require('../models/followUp');
const Bootcamp = require('../models/bootcampData/bootcamp');

router.get('/', async (req, res) => {
  try {
    const [studentsCount, notInterestedCount, interestedCount, followUpCount, bootcampCount] = await Promise.all([
      Student.countDocuments(),
      NotInterested.countDocuments(),
      Interested.countDocuments(),
      FollowUp.countDocuments(),
      Bootcamp.countDocuments()
    ]);

    const totalCounts = {
      students: studentsCount,
      notInterested: notInterestedCount,
      interested: interestedCount,
      followUp: followUpCount,
      bootcamp: bootcampCount
    };


    res.status(200).json(totalCounts);
  } catch (error) {
    console.error('Error fetching total records:', error);
    res.status(500).send({ error: 'Error fetching total records' });
  }
});

module.exports = router;
