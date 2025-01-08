/*const express = require('express');
const router = express.Router();
const InquiryStudent = require('../models/Inquiry');
const { db } = require('../../firebase.js');

// API Endpoint to Save Student Data (Mongodb)
/*router.post('/', async (req, res) => {
  try {
    const student = new InquiryStudent(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send({ error: 'Error saving student data', details: error });
  }
});

// API Endpoint to Save Student (inquiries) Data (Firebase Firestore)
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('inquiries').add(data);
    res.status(201).json({ id: docRef.id, message: 'Inquiry added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding inquiry', details: error.message });
  }
});

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
            { firstName: new RegExp(searchQuery, 'i') }, 
            { lastName: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { mobileNumber: new RegExp(searchQuery, 'i') },
            { course: new RegExp(searchQuery, 'i') },
          ]
        }
      : {};

      if (course && course !== 'All') {
        baseFilter.course = course;
      }

    totalDocuments = await InquiryStudent.countDocuments(baseFilter);

    student = await InquiryStudent.find(baseFilter)
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
      name: toTitleCase(`${user.firstName} ${user.lastName}`)  
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
    const student = await InquiryStudent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send(student);
  } catch (error) {
    res.status(400).send({ error: 'Error updating student data', details: error });
  }
});

// API Endpoint to Delete Student
router.delete('/:id', async (req, res) => {
  try {
    const student = await InquiryStudent.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting student', details: error });
  }
});

module.exports = router;*/

const express = require('express');
const router = express.Router();
const { db } = require('../../firebase.js');
const logger = require('../../logger.js');

// Utility function to convert to Title Case
const toTitleCase = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// API Endpoint to Save Student (inquiries) Data (Firebase Firestore)
router.post('/', async (req, res) => {
  logger.info('API call received: POST /api/students');

  try {
    const data = req.body;
    const docRef = await db.collection('inquiries').add(data);

    logger.info(`Inquiry added successfully to "inquiries" collection with ID: ${docRef.id}`);
    res.status(201).json({ id: docRef.id, message: 'Inquiry added successfully!' });
  } catch (error) {

    logger.error('Error adding inquiry to "inquiries" collection:', error.message);
    res.status(500).json({ error: 'Error adding inquiry', details: error.message });
  }
});

router.get('/', async (req, res) => {
  logger.info('API call received: GET /api/students');
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { course } = req.query;

    let query = db.collection('inquiries');
    
    if (course && course !== 'All') {
      query = query.where('course', '==', course);
      logger.info(`Filtering inquiries by course: ${course}`);
    }

    const snapshot = await query.offset(skip).limit(limit).get();
    const totalDocsSnapshot = await db.collection('inquiries').get(); 

    let students = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: toTitleCase(`${data.firstName || ''} ${data.lastName || ''}`),
      };
    });

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      students = students.filter(user => {
        return (
          user.firstName.toLowerCase().includes(lowerSearchQuery) ||
          user.lastName.toLowerCase().includes(lowerSearchQuery) ||
          user.email.toLowerCase().includes(lowerSearchQuery) ||
          user.mobileNumber.toLowerCase().includes(lowerSearchQuery) ||
          user.course.toLowerCase().includes(lowerSearchQuery)
        );
      });
      logger.info(`Search query applied: ${searchQuery}, results: ${students.length}`);
    }

    const totalDocuments = totalDocsSnapshot.size;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: students,
    });
  } catch (error) {
    logger.error('Error fetching student information from "inquiries" collection:', error.message);
    res.status(400).send({ error: 'Error fetching student information', details: error });
  }
});

// API Endpoint to Update Student Data
router.put('/:id', async (req, res) => {
  logger.info(`API call received: PUT /api/students/${req.params.id}`);
  try {
    const data = req.body;
    const docRef = db.collection('inquiries').doc(req.params.id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      logger.error(`Student with ID: ${req.params.id} not found in "inquiries" collection`);
      return res.status(404).send({ error: 'Student not found' });
    }

    await docRef.update(data);
    logger.info(`Student with ID: ${req.params.id} updated successfully in "inquiries" collection`);
    res.status(200).json({ message: 'Student updated successfully!' });
  } catch (error) {
    logger.error(`Error updating student with ID: ${req.params.id} in "inquiries" collection:`, error.message);
    res.status(400).send({ error: 'Error updating student data', details: error.message });
  }
});

// API Endpoint to Delete Student
router.delete('/:id', async (req, res) => {
  logger.info(`API call received: DELETE /api/students/${req.params.id}`);
  try {
    const docRef = db.collection('inquiries').doc(req.params.id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      logger.error(`Student with ID: ${req.params.id} not found in "inquiries" collection`);
      return res.status(404).send({ error: 'Student not found' });
    }

    await docRef.delete();
    logger.info(`Student with ID: ${req.params.id} deleted successfully from "inquiries" collection`);

    res.status(200).send({ message: 'Student deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting student with ID: ${req.params.id} from "inquiries" collection:`, error.message);
    res.status(400).send({ error: 'Error deleting student', details: error.message });
  }
});

module.exports = router;

