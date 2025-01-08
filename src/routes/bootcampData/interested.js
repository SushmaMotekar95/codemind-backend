const express = require('express');
const router = express.Router();
const Interested = require('../../models/bootcampData/interested'); 
const CourseFees = require('../../models/coursesData/fees');
// const { sendInterestedEmail } = require('./Email/interestedEmail'); 

// POST route to create a new Interested Bootcamp inquiry
router.post('/', async (req, res) => {
  try {
    const interested = new Interested(req.body);
    await interested.save();

    res.status(201).send(interested);
  } catch (error) {
    res.status(400).send({ error: 'Error saving interested Bootcamp inquiry', details: error });
  }
});

// GET route to fetch all Interested inquiries
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;  
    const skip = (page - 1) * limit;  
    let InterestedInfo, totalDocuments;
    const { course } = req.query;
    const baseFilter = searchQuery
      ? {
          $or: [
            { firstName: new RegExp(searchQuery, 'i') }, 
            { lastName: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { mobileNumber: new RegExp(searchQuery, 'i') },
            { course: new RegExp(searchQuery, 'i') },
            { batch: new RegExp(searchQuery, 'i') },
            { source: new RegExp(searchQuery, 'i') },
            { sourcecomment: new RegExp(searchQuery, 'i') },
          ]
        }
      : {};
    
      if (course && course !== 'All') {
        baseFilter.course = course;
      }

    totalDocuments = await Interested.countDocuments(baseFilter);

    InterestedInfo = await Interested.find(baseFilter)
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalDocuments / limit);

     //TitleCase
     const toTitleCase = (str) => {
      return str.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    };
     // Fetch course fees and combine with student data
     const InterestedInfoWithFees = await Promise.all(
      InterestedInfo.map(async (student) => {
        const courseFees = await CourseFees.findOne({ name: student.course });
        return {
          ...student._doc, // Spread the student document properties
          name: toTitleCase(`${student.firstName} ${student.lastName}`),
          totalFees: courseFees ? courseFees.totalFees : 'Course not found', 
        };
      })
    );
    
    res.status(200).send({
      totalRecords: totalDocuments,  
      totalPages,      
      currentPage: page,  
      data: InterestedInfoWithFees
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching bootcamp followup student information', details: error });
  }
});


// PUT route to update an Interested inquiry by ID
router.put('/:id', async (req, res) => {
  try {
    const interestedId = req.params.id;
    const updatedInterested = await Interested.findByIdAndUpdate(interestedId, req.body, { new: true, runValidators: true });

    if (!updatedInterested) {
      return res.status(404).send({ error: 'bootcamp Interested inquiry not found' });
    }

    res.status(200).send(updatedInterested);
  } catch (error) {
    res.status(400).send({ error: 'Error updating nootcamp interested inquiry', details: error });
  }
});

// New route for sending the email
router.post('/:id/send-email', async (req, res) => {
  try {
    const interestedId = req.params.id;
    await sendInterestedEmail(interestedId); 
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error sending email', details: error });
  }
});

// API Endpoint to Delete Student
router.delete('/:id', async (req, res) => {
  try {
    const  deleteInterested = await Interested.findByIdAndDelete(req.params.id);
    if (!deleteInterested) {
      return res.status(404).send({ error: 'bootcamp Student not found' });
    }
    res.status(200).send({ message: 'bootcamp Student deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting bootcamp student', details: error });
  }
});

module.exports = router;
