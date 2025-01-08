const express = require('express');
const router = express.Router();
const FollowUp = require('../models/followUp');
const Student = require('../models/Inquiry');

// API Endpoint to Save Student Data
router.post('/', async (req, res) => {
  try {
    const followup = new FollowUp(req.body);
    await followup.save();
    res.status(201).send(followup);
  } catch (error) {
    res.status(400).send({ error: 'Error saving student data', details: error });
  }
});

// API Endpoint to Get Student Information Data
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;  
    const skip = (page - 1) * limit;  
    let FollowUpInfo, totalDocuments;
    const { course, inquiryStatus, startDate, endDate} = req.query;
    const baseFilter = searchQuery
      ? {
          $or: [
            { firstName: new RegExp(searchQuery, 'i') }, 
            { lastName: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { mobileNumber: new RegExp(searchQuery, 'i') },
            { course: new RegExp(searchQuery, 'i') },
            { inquiryStatus: new RegExp(searchQuery, 'i') },
            { batch: new RegExp(searchQuery, 'i') },
            { source: new RegExp(searchQuery, 'i') },
            { sourcecomment: new RegExp(searchQuery, 'i') },
          ]
        }
      : {};

      if (course && course !== 'All') {
        baseFilter.course = course;
      }

      if (inquiryStatus && inquiryStatus !== 'All') {
        baseFilter.inquiryStatus = inquiryStatus;
      }

      if (startDate) {
        baseFilter.date = { ...baseFilter.date, $gte: new Date(startDate) };
      }

      if (endDate) {
        baseFilter.date = { ...baseFilter.date, $lte: new Date(endDate) };
      }
  
    totalDocuments = await FollowUp.countDocuments(baseFilter);

    FollowUpInfo = await FollowUp.find(baseFilter)
      .skip(skip)
      .limit(limit);

     //TitleCase
     const toTitleCase = (str) => {
      return str.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    };
    
     const modifiedFollowUpInfo =  FollowUpInfo.map(user => ({
      ...user.toObject(),  
      name: toTitleCase(`${user.firstName} ${user.lastName}`)  
    }));

    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,  
      totalPages,      
      currentPage: page,  
      data: modifiedFollowUpInfo
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching followup student information', details: error });
  }
});


// API Endpoint to Update Follow-Up Data
router.put('/:id', async (req, res) => {
    try {
      const followUpId = req.params.id;
      const updatedFollowUp = await FollowUp.findByIdAndUpdate(followUpId, req.body, { new: true, runValidators: true, });
  
      if (!updatedFollowUp) {
        return res.status(404).send({ error: 'Follow-up not found' });
      }
  
      res.status(200).send(updatedFollowUp);
    } catch (error) {
      res.status(400).send({ error: 'Error updating follow-up data', details: error });
    }
  });

  // API Endpoint to Delete perticular Student
router.delete('/:id', async (req, res) => {
  try {
    const  deleteStudent = await FollowUp.findByIdAndDelete(req.params.id);
    if (!deleteStudent) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send({ message: 'FollowUp Student deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting FollowUp Student', details: error });
  }
});

module.exports = router;