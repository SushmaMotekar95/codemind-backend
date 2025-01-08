const express = require('express');
const router = express.Router();
const HireUsNotInterested = require('../../models/hireFromUsData/notInterested');
// const { sendInterestedEmail } = require('./Email/interestedEmail'); 

// POST route to create a new Interested HireUs
router.post('/', async (req, res) => {
  try {
    const notInterested = new HireUsNotInterested(req.body);
    await notInterested.save();

    res.status(201).send(notInterested);
  } catch (error) {
    res.status(400).send({ error: 'Error saving HireUs not Interested ', details: error });
  }
});

//Get route 
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let HireUsNotInterestedInfo, totalDocuments;
    const baseFilter = searchQuery
      ? {
        $or: [
          { name: new RegExp(searchQuery, 'i') },
          { compileDeclareFactoryFunction: new RegExp(searchQuery, 'i') },
          { email: new RegExp(searchQuery, 'i') },
          { mobileNumber: new RegExp(searchQuery, 'i') },
          { inquiryStatus: new RegExp(searchQuery, 'i') },
          { source: new RegExp(searchQuery, 'i') },
          { sourcecomment: new RegExp(searchQuery, 'i') },
        ]
      }
      : {};

    totalDocuments = await HireUsNotInterested.countDocuments(baseFilter);

    HireUsNotInterestedInfo = await HireUsNotInterested.find(baseFilter)
      .skip(skip)
      .limit(limit);

    //TitleCase
    const toTitleCase = (str) => {
      return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const modifiedHireUsNotInterestedInfo = HireUsNotInterestedInfo.map(user => ({
      ...user.toObject(),
      name: toTitleCase(`${user.name}`)
    }));

    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: modifiedHireUsNotInterestedInfo
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching HireUs Not Interested information', details: error });
  }
});

// API Endpoint to Update HireUs
router.put('/:id', async (req, res) => {
  try {
    const notInterestedId = req.params.id;
    const updatedNotInterested = await  HireUsNotInterested.findByIdAndUpdate(notInterestedId, req.body, { new: true, runValidators: true });
    
    if (!updatedNotInterested) {
      return res.status(404).send({ error: 'HireUs Not Interested not found' });
    }

    res.status(200).send(updatedNotInterested);
  } catch (error) {
    res.status(400).send({ error: 'Error updating HireUs Not Interested', details: error });
  }
});

// API Endpoint to Delete HireUs
router.delete('/:id', async (req, res) => {
  try {
    const deleteHireUsNotInterested = await HireUsNotInterested.findByIdAndDelete(req.params.id);
    if (!deleteHireUsNotInterested) {
      return res.status(404).send({ error: 'HireUs NotInterested not found' });
    }
    res.status(200).send({ message: 'HireUs NotInterested deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting HireUs NotInterested', details: error });
  }
});
module.exports = router;