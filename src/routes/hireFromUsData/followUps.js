const express = require('express');
const router = express.Router();
const HireUsFollowUp = require('../../models/hireFromUsData/followUp');
// const { sendInterestedEmail } = require('./Email/interestedEmail'); 

// POST route to create a new Interested HireUs
router.post('/', async (req, res) => {
  try {
    const followUp = new HireUsFollowUp(req.body);
    await followUp.save();

    res.status(201).send(followUp);
  } catch (error) {
    res.status(400).send({ error: 'Error saving HireUs FollowUp ', details: error });
  }
});

//Get route 
router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let HireUsFollowUpInfo , totalDocuments;
      const{ course }=req.query;
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
        // if (course && course !== 'All') {
        //   baseFilter.course = course;
        // }
  
      totalDocuments = await HireUsFollowUp.countDocuments(baseFilter);
      
      HireUsFollowUpInfo = await HireUsFollowUp.find(baseFilter)
        .skip(skip)
        .limit(limit);
      
       //TitleCase
       const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
      const modifiedHireUsFollowUpInfo  =   HireUsFollowUpInfo.map(user => ({
        ...user.toObject(),  
        name: toTitleCase(`${user.name}`)  
      }));
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data: modifiedHireUsFollowUpInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching HireUs FollowUp information', details: error });
    }
  });

  // API Endpoint to Update Follow-Up Data
router.put('/:id', async (req, res) => {
  try {
    const followUpId = req.params.id;
    const updatedFollowUp = await HireUsFollowUp.findByIdAndUpdate(followUpId, req.body, { new: true, runValidators: true, });

    if (!updatedFollowUp) {
      return res.status(404).send({ error: 'HireUs Follow-up not found' });
    }

    res.status(200).send(updatedFollowUp);
  } catch (error) {
    res.status(400).send({ error: 'Error updating HireUs follow-up data', details: error });
  }
});

  
  // API Endpoint to Delete HireUs
router.delete('/:id', async (req, res) => {
    try {
      const  deleteHireUsFollowUp = await HireUsFollowUp.findByIdAndDelete(req.params.id);
      if (!deleteHireUsFollowUp) {
        return res.status(404).send({ error: 'HireUs FollowUp not found' });
      }
      res.status(200).send({ message: 'HireUs FollowUp deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: 'Error deleting HireUs FollowUp', details: error });
    }
  });
  

  module.exports = router;