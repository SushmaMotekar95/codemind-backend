const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HireUsNewLeads = require('../../models/hireFromUsData/newLeads'); 
const Interested = require('../../models/hireFromUsData/interested');
const NotInterested  = require('../../models/hireFromUsData/notInterested');
const FollowUp = require('../../models/hireFromUsData/followUp');

router.get('/', async (req, res) => {
  try {
    const [HireUsCount, notInterestedCount, interestedCount, followUpCount] = await Promise.all([
      HireUsNewLeads.countDocuments(),
      NotInterested.countDocuments(),
      Interested.countDocuments(),
      FollowUp.countDocuments(),
    ]);

    const totalCounts = {
      HireUsNewLeads: HireUsCount,
      notInterested: notInterestedCount,
      interested: interestedCount,
      followUp: followUpCount,
    };
    res.status(200).json(totalCounts);
  } catch (error) {
    console.error('Error fetching total records:', error);
    res.status(500).send({ error: 'Error fetching total records' });
  }
});

module.exports = router;
