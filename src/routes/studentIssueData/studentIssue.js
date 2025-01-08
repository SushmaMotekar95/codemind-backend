/*const express = require('express');
const router = express.Router();
const StudentIssue = require('../../models/studentIssueData/studentIssue');
const { db } = require('../../../firebase.js');

// API Endpoint to Save Student Issue Data (mongodb)
router.post('/', async (req, res) => {
  try {
    const studentIssue  = new StudentIssue(req.body);
    await studentIssue.save();
    res.status(201).send(studentIssue);
  } catch (error) {
    res.status(400).send({ error: 'Error saving student issue data', details: error });
  }
});

router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let StudentIssueInfo, totalDocuments;
      const { course, issueStatus, startDate, endDate} = req.query;
      const baseFilter = searchQuery
        ? {
            $or: [
              { firstName: new RegExp(searchQuery, 'i') }, 
              { lastName: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { mobileNumber: new RegExp(searchQuery, 'i') },
              { course: new RegExp(searchQuery, 'i') },
              { issueStatus: new RegExp(searchQuery, 'i') },
              { batch: new RegExp(searchQuery, 'i') },
              { source: new RegExp(searchQuery, 'i') },
              { 'technicalExpert.technicalExpertName': new RegExp(searchQuery, 'i') },
            ]
          }
        : {};

        if (course && course !== 'All') {
          baseFilter.course = course;
        }
  
        if ( issueStatus &&  issueStatus !== 'All') {
          baseFilter. issueStatus =  issueStatus;
        }
  
        if (startDate) {
          baseFilter.date = { ...baseFilter.issue_created_date, $gte: new Date(startDate) };
        }
  
        if (endDate) {
          baseFilter.date = { ...baseFilter.issue_created_date, $lte: new Date(endDate) };
        }
    
      totalDocuments = await  StudentIssue.countDocuments(baseFilter);
  
      StudentIssueInfo = await StudentIssue.find(baseFilter)
        .skip(skip)
        .limit(limit);
  
       //TitleCase
       const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
       const modifiedStudentIssueInfo =  StudentIssueInfo.map(user => ({
        ...user.toObject(),  
        name: toTitleCase(`${user.firstName} ${user.lastName}`)  
      }));
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data: modifiedStudentIssueInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching Student Issue', details: error });
    }
  });
  
  
  // API Endpoint to Update Follow-Up Data
  router.put('/:id', async (req, res) => {
      try {
        const studentIssueId = req.params.id;
        const updatedStudentIssue = await StudentIssue.findByIdAndUpdate(studentIssueId, req.body, { new: true, runValidators: true, });
    
        if (!updatedStudentIssue) {
          return res.status(404).send({ error: 'Student Issue not found' });
        }
    
        res.status(200).send(updatedStudentIssue);
      } catch (error) {
        res.status(400).send({ error: 'Error updating Student Issue data', details: error });
      }
    });
  
    // API Endpoint to Delete perticular Student
  router.delete('/:id', async (req, res) => {
    try {
      const  deleteStudent = await StudentIssue.findByIdAndDelete(req.params.id);
      if (!deleteStudent) {
        return res.status(404).send({ error: 'Student not found' });
      }
      res.status(200).send({ message: 'FollowUp Student deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: 'Error deleting FollowUp Student', details: error });
    }
  });
  
  module.exports = router;*/

  const express = require('express');
  const router = express.Router();
  const { db } = require('../../../firebase.js');
  const admin = require('firebase-admin');
  const logger = require('../../../logger.js');

  // Initialize Firestore
  const db1 = admin.firestore();

  // API Endpoint to Save Student Issue Data (firebase firestore)
router.post('/', async (req, res) => {
  logger.info(`API call received: POST /api/studentIssues`);
  try {
    const src =  req.body;
    const data = {
      ...src,
      source: 'Codemind Website', 
      issueStatus: 'New Issue', 
      issue_created_date: admin.firestore.FieldValue.serverTimestamp(), 
    };
 
    const docRef = await db.collection('studentIssues').add(data);
    logger.info(`Student Issue data added successfully to "studentIssues" collection with ID: ${docRef.id}`);
    res.status(201).json({ id: docRef.id, message: 'studentIssues data added successfully!' });
  } catch (error) {
    logger.error(`Error adding Student Issue data to "studentIssues" collection: ${error.message}`);
    res.status(500).json({ error: 'Error adding studentIssues data', details: error.message });
  }
});

router.get('/', async (req, res) => {
 logger.info(`API call received: GET /api/studentIssues`);
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { course, issueStatus, startDate, endDate } = req.query;

    let query = db.collection('studentIssues'); 

    // Apply filters
    if (course && course !== 'All') {
      query = query.where('course', '==', course);
    }
    if (issueStatus && issueStatus !== 'All') {
      query = query.where('issueStatus', '==', issueStatus);
    }
    if (startDate) {
      query = query.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('date', '<=', new Date(endDate));
    }

    const snapshot = await query.offset(skip).limit(limit).get();
    const totalDocsSnapshot = await db.collection('studentIssues').get();

    let studentIssues = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: toTitleCase(`${data.firstName || ''} ${data.lastName || ''}`),
      };
    });

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      studentIssues = studentIssues.filter(issue => {
        return (
          issue.name?.toLowerCase().includes(lowerSearchQuery) ||
          issue.email?.toLowerCase().includes(lowerSearchQuery) ||
          issue.mobileNumber?.toLowerCase().includes(lowerSearchQuery) ||
          issue.course?.toLowerCase().includes(lowerSearchQuery) ||
          issue.issueStatus?.toLowerCase().includes(lowerSearchQuery) ||
          issue.batch?.toLowerCase().includes(lowerSearchQuery) ||
          issue.source?.toLowerCase().includes(lowerSearchQuery) //||
          //issue['technicalExpert']?.technicalExpertName?.toLowerCase().includes(lowerSearchQuery)
        );
      });
    }

    // Calculate total documents and pages
    const totalDocuments = totalDocsSnapshot.size;
    const totalPages = Math.ceil(totalDocuments / limit);

    // Return the response
    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: studentIssues,
    });
  } catch (error) {
    logger.error(`Error fetching Student Issues from "studentIssues" collection: ${error.message}`);
    res.status(400).send({ error: 'Error fetching Student Issues', details: error });
  }
});

// Helper function: Convert string to Title Case
const toTitleCase = str => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// PUT: Update a Student Issue
router.put('/:id', async (req, res) => {
logger.info(`API call received: PUT /api/studentIssues/${ req.params.id}`);
  try {
    const studentIssueId = req.params.id;
    const data = req.body;

    const docRef = db.collection('studentIssues').doc(studentIssueId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error(`Student Issue with ID: ${studentIssueId} not found in "studentIssues" collection`);
      return res.status(404).send({ error: 'Student Issue not found' });
    }

    await docRef.update(data);

    const updatedDoc = await docRef.get();

    logger.info(`Student Issue with ID: ${studentIssueId} updated successfully in "studentIssues" collection`);
    res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {

    logger.error(`Error updating Student Issue with ID: ${req.params.id} in "studentIssues" collection: ${error.message}`);
    res.status(400).send({ error: 'Error updating Student Issue data', details: error.message });
  }
});

// DELETE: Delete a Student Issue
router.delete('/:id', async (req, res) => {
logger.info(`API call received: DELETE /api/studentIssues/${ req.params.id}`);
  try {
    const studentIssueId = req.params.id;

    const docRef = db.collection('studentIssues').doc(studentIssueId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error(`Student Issue with ID: ${studentIssueId} not found in "studentIssues" collection`);
      return res.status(404).send({ error: 'Student Issue not found' });
    }

    await docRef.delete();
    logger.info(`Student Issue with ID: ${studentIssueId} deleted successfully from "studentIssues" collection`);
    res.status(200).send({ message: 'Student Issue deleted successfully' });
  } catch (error) {
    
    logger.error(`Error deleting Student Issue with ID: ${req.params.id} from "studentIssues" collection: ${error.message}`);
    res.status(400).send({ error: 'Error deleting Student Issue', details: error.message });
  }
});

  module.exports = router;