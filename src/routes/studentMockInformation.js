const express = require('express');
const router = express.Router();
const StudentMockInformation = require('../models/studentMockInformation');

router.post('/', async (req, res) => {
  try {
    const studentMockInfo = new StudentMockInformation(req.body);
    await studentMockInfo.save();
    res.status(201).send(studentMockInfo);
  } catch (error) {
    res.status(400).send({ error: 'Error saving student mock information', details: error });
  }
});

router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;  
    const skip = (page - 1) * limit;
  
    const { batch, course, mockNumber, mockStatus } = req.query;
    
    // Build the base filter with search query
    let baseFilter = searchQuery
      ? {
          $or: [
            { name: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { course: new RegExp(searchQuery, 'i') },
            { batch: new RegExp(searchQuery, 'i') },
            { graduation: new RegExp(searchQuery, 'i') },
            { contactNo: new RegExp(searchQuery, 'i') },
            { 'mocks.mockNumber': new RegExp(searchQuery, 'i') },
            { 'mocks.mockStatus': new RegExp(searchQuery, 'i') }
          ]
        }
      : {};

    // Apply filters to the base query
    if (batch && batch !== 'All') {
      baseFilter.batch = batch;
    }

    if (course && course !== '') {
      baseFilter.course = course;
    }

    if (mockNumber && parseInt(mockNumber) > 0) {
      const mockNumberStr = `Mock-${mockNumber}`; 
      baseFilter['mocks.mockNumber'] = mockNumberStr; 
    }
 
    if (mockStatus && mockStatus !== 'All') {
      if (mockStatus === 'Pending') {
        // Handle the case for 'Pending'
        baseFilter['$or'] = [
          { 'mocks': { $exists: false } }, 
          { 'mocks': { $size: 0 } },       
          { 'mocks.mockNumber': { $exists: false } } 
        ];
      } else {
        // For other statuses, match by mock status and mock number
        baseFilter['mocks'] = {
          $elemMatch: {
            mockStatus: new RegExp(mockStatus, 'i')
          }
        };
      }
    }
    // Count the total number of documents that match the filter
    const totalDocuments = await StudentMockInformation.countDocuments(baseFilter);

    // Fetch the filtered documents with pagination
    const studentMockInfo = await StudentMockInformation.find(baseFilter)
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: studentMockInfo
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching student mock information', details: error });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const studentMockInfo = await StudentMockInformation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!studentMockInfo) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send(studentMockInfo);
  } catch (error) {
    res.status(400).send({ error: 'Error updating student mock information', details: error });
  }
});

// API Endpoint to Delete perticular Student
router.delete('/:id', async (req, res) => {
  try {
    const  deleteStudent = await StudentMockInformation.findByIdAndDelete(req.params.id);
    if (!deleteStudent) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send({ message: 'Student Mock Information deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting Student Mock Information', details: error });
  }
});

module.exports = router;