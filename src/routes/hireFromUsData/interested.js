const express = require('express');
const router = express.Router();
const HireUsInterested = require('../../models/hireFromUsData/interested');
// const { sendInterestedEmail } = require('./Email/interestedEmail'); 

// POST route to create a new Interested HireUs
router.post('/', async (req, res) => {
  try {
    const interested = new HireUsInterested(req.body);
    await interested.save();

    res.status(201).send(interested);
  } catch (error) {
    res.status(400).send({ error: 'Error saving HireUs interested ', details: error });
  }
});

//Get route 
router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let   HireUsInterestedInfo, totalDocuments;
      const baseFilter = searchQuery
        ? {
            $or: [
              { name: new RegExp(searchQuery, 'i') }, 
              { company: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { mobileNumber: new RegExp(searchQuery, 'i') },
              { inquiryStatus: new RegExp(searchQuery, 'i') },
              { source: new RegExp(searchQuery, 'i') },
              { sourcecomment: new RegExp(searchQuery, 'i') },
            ]
          }
        : {};
  
      totalDocuments = await HireUsInterested.countDocuments(baseFilter);
      
      HireUsInterestedInfo = await HireUsInterested.find(baseFilter)
        .skip(skip)
        .limit(limit);
      
       //TitleCase
       const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
      const modifiedHireUsInterestedInfo  =  HireUsInterestedInfo.map(user => ({
        ...user.toObject(),  
        name: toTitleCase(`${user.name}`)  
      }));
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data: modifiedHireUsInterestedInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching HireUs Interested information', details: error });
    }
  });

  // PUT route to update an Interested inquiry by ID
router.put('/:id', async (req, res) => {
  try {
    const interestedId = req.params.id;
    const updatedInterested = await HireUsInterested.findByIdAndUpdate(interestedId, req.body, { new: true, runValidators: true });

    if (!updatedInterested) {
      return res.status(404).send({ error: 'Interested inquiry not found' });
    }

    res.status(200).send(updatedInterested);
  } catch (error) {
    res.status(400).send({ error: 'Error updating interested inquiry', details: error });
  }
});
  
  // API Endpoint to Delete HireUs
router.delete('/:id', async (req, res) => {
    try {
      const  deleteHireUsInterested = await HireUsInterested.findByIdAndDelete(req.params.id);
      if (!deleteHireUsInterested) {
        return res.status(404).send({ error: 'Student not found' });
      }
      res.status(200).send({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: 'Error deleting student', details: error });
    }
  });
  

  module.exports = router;