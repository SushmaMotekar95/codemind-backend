//mongdb 
/*const express = require('express');
const router = express.Router();
const HireUsData = require('../../models/hireFromUsData/newLeads');
const { db } = require('../../../firebase.js');

// API Endpoint to Save Student (HireFromUs) Data (mongodb)
router.post('/', async (req, res) => {
  try {
    const student = new HireUsData(req.body);
    await student.save();
    res.status(201).send(student);
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
    let student, totalDocuments;
    const { course } = req.query;
    const baseFilter = searchQuery
      ? {
          $or: [
            { name: new RegExp(searchQuery, 'i') }, 
            { company: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { mobileNumber: new RegExp(searchQuery, 'i') },
            { course: new RegExp(searchQuery, 'i') },
            { lookingFor: new RegExp(searchQuery, 'i')}
          ]
        }
      : {};

      if (course && course !== 'All') {
        baseFilter.course = course;
      }

    totalDocuments = await  HireUsData.countDocuments(baseFilter);

    student = await  HireUsData.find(baseFilter)
      .skip(skip)
      .limit(limit);

    //TitleCase
    const toTitleCase = (str) => {
      return str.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    };
    
    const modifiedStudentInfo =  student.map(user => ({
      ...user.toObject(),  
      name: toTitleCase(`${user.name}`)  
    }));

    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,  
      totalPages,      
      currentPage: page,  
      data:modifiedStudentInfo
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching student information', details: error });
  }
});

// API Endpoint to Update Student Data
router.put('/:id', async (req, res) => {
  try {
    const student = await  HireUsData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send(student);
  } catch (error) {
    res.status(400).send({ error: 'Error updating student data', details: error });
  }
});

// API Endpoint to Delete HireUs
router.delete('/:id', async (req, res) => {
  try {
    const student = await  HireUsData.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).send({ error: 'HireUs not found' });
    }
    res.status(200).send({ message: 'HireUs deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting HireUs', details: error });
  }
});

module.exports = router;*/

//Firebase Firestore 
const express = require('express');
const router = express.Router();
const HireUsData = require('../../models/hireFromUsData/newLeads');
const { db } = require('../../../firebase.js');
const logger = require('../../../logger.js');

// Helper function: Convert string to Title Case
const toTitleCase = str => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// API Endpoint to Save Student (hireFormUs) Data (firebase firestore)
router.post('/', async (req, res) => {
  logger.info(`API call received: POST /api/hireus`);
  try {
    const data = req.body;
    const docRef = await db.collection('hireFromUs').add(data);
    logger.info(`Data added successfully to "hireFromUs" collection with ID: ${docRef.id}`);
    res.status(201).json({ id: docRef.id, message: 'hireFromUs data added successfully!' });
  } catch (error) {
    logger.error(`Error adding data to "hireFromUs" collection: ${error.message}`);
    res.status(500).json({ error: 'Error adding hireFromUs data', details: error.message });
  }
});

router.get('/', async (req, res) => {
  logger.info(`API call received: GET /api/hireus`);
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { course, lookingFor } = req.query;

    let query = db.collection('hireFromUs'); 

    if (course && course !== 'All') {
      query = query.where('course', '==', course);
    }
    if (lookingFor && lookingFor !== 'All') {
      query = query.where('lookingFor', '==', lookingFor);
    }

    const snapshot = await query.offset(skip).limit(limit).get();
    const totalDocsSnapshot = await db.collection('hireFromUs').get();

    let hireFormUsData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: toTitleCase(data.name || ''), 
      };
    });

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      hireFormUsData = hireFormUsData.filter(item => {
        return (
          item.name?.toLowerCase().includes(lowerSearchQuery) ||
          item.company?.toLowerCase().includes(lowerSearchQuery) ||
          item.email?.toLowerCase().includes(lowerSearchQuery) ||
          item.mobileNumber?.toLowerCase().includes(lowerSearchQuery) ||
          item.course?.toLowerCase().includes(lowerSearchQuery) ||
          item.lookingFor?.toLowerCase().includes(lowerSearchQuery)
        );
      });
    }

    const totalDocuments = totalDocsSnapshot.size;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: hireFormUsData,
    });
  } catch (error) {
    logger.error(`Error fetching data from "hireFromUs" collection: ${error.message}`);
    res.status(400).send({ error: 'Error fetching Hire Form Us data', details: error });
  }
});

// API Endpoint to Update Student Data (Firestore)
router.put('/:id', async (req, res) => {
  logger.info(`API call received: PUT /api/hireus/${ req.params.id}`);
  try {
    const studentId = req.params.id;
    const studentData = req.body;

    const docRef = db.collection('hireFromUs').doc(studentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error(`HireUs data with ID ${studentId} not found in "hireFromUs" collection`);
      return res.status(404).send({ error: 'Student not found' });
    }

    await docRef.update(studentData);
    logger.info(`Successfully updated HireUs data with ID: ${studentId} in "hireFromUs" collection`);
    res.status(200).send({ id: studentId, ...studentData });
  } catch (error) {
    logger.error(`Error updating data in "hireFromUs" collection: ${error.message}`);
    res.status(400).send({ error: 'Error updating student data', details: error });
  }
});

// API Endpoint to Delete HireUs (Firestore)
router.delete('/:id', async (req, res) => {
  logger.info(`API call received: DELETE /api/hireus/${ req.params.id}`);
  try {
    const studentId = req.params.id;

    const docRef = db.collection('hireFromUs').doc(studentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error(`HireUs data with ID ${studentId} not found in "hireFromUs" collection`);
      return res.status(404).send({ error: 'HireUs not found' });
    }

    await docRef.delete();
    logger.info(`Successfully deleted HireUs data with ID: ${studentId} from "hireFromUs" collection`);
    res.status(200).send({ message: 'HireUs deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting data from "hireFromUs" collection: ${error.message}`);
    res.status(400).send({ error: 'Error deleting HireUs', details: error });
  }
});

module.exports = router;

