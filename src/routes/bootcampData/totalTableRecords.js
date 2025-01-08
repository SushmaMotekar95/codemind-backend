const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const NotInterested = require('../../models/bootcampData/notInterested');
const Interested = require('../../models/bootcampData/interested');
const FollowUp = require('../../models/bootcampData/followUp');
const Bootcamp = require('../../models/bootcampData/bootcamp');
const CodemindBootcamp = require('../../models/bootcampData/codemindBootcamp');

router.get('/', async (req, res) => {
  try {
    const [ notInterestedCount, interestedCount, followUpCount, bootcampCount, codemindBootcampCount] = await Promise.all([
      NotInterested.countDocuments(),
      Interested.countDocuments(),
      FollowUp.countDocuments(),
      Bootcamp.countDocuments(),
      CodemindBootcamp.countDocuments(),
    ]);

    const totalCounts = {
      notInterested: notInterestedCount,
      interested: interestedCount,
      followUp: followUpCount,
      bootcamp: bootcampCount,
      codemindBootcamp: codemindBootcampCount
    };


    res.status(200).json(totalCounts);
  } catch (error) {
    console.error('Error fetching total records:', error);
    res.status(500).send({ error: 'Error fetching total records' });
  }
});

module.exports = router;
