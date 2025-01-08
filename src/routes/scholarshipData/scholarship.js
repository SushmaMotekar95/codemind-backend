/*const express = require('express');
const router = express.Router();
const Scholarship = require('../../models/scholarshipData/scholarship');
const { sendScholarshipEmail } = require('../scholarshipData/services/emailService');
const CourseFees = require('../../models/coursesData/fees');
const { db } = require('../../../firebase.js');

// Function to convert a string to title case
const toTitleCase = (str) => {
   return str.replace(/\w\Sg, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// API Endpoint to Save HireUs Data without email (mongodb)
router.post('/', async (req, res) => {
  try {
    const ScholarshipData = new Scholarship(req.body);
    await ScholarshipData.save();
    res.status(201).send(ScholarshipData);
  } catch (error) {
    res.status(400).send({ error: 'Error saving Scholarship data', details: error });
  }
});


//API Endpoint to Save codemind website data with email 
router.post('/codemind', async (req, res) => {
  try {

    // Convert name in the request body to title case
    req.body.name = toTitleCase(req.body.name);

    const ScholarshipData = new Scholarship(req.body);
    await ScholarshipData.save();

    // Send the scholarship email
     await sendScholarshipEmail(ScholarshipData.email, ScholarshipData.name);

    res.status(201).send(ScholarshipData);
  } catch (error) {
    res.status(400).send({ error: 'Error saving Scholarship data', details: error });
  }
});

router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let  ScholarshipInfo , totalDocuments;
      const { scholarshipStatus } = req.query;
      const baseFilter = searchQuery
        ? {
            $or: [
              { name: new RegExp(searchQuery, 'i') }, 
              { collegeName: new RegExp(searchQuery, 'i') },
              { mobileNumbe: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { address: new RegExp(searchQuery, 'i') },
              { scholarshipStatus: new RegExp(searchQuery, 'i')},
              { interviewFeedback: new RegExp(searchQuery, 'i')}, 
              { source: new RegExp(searchQuery, 'i') },
            ]
          }
        : {};

        if ( scholarshipStatus &&  scholarshipStatus !== '') {
            baseFilter.scholarshipStatus =  scholarshipStatus;
          }

      totalDocuments = await  Scholarship.countDocuments(baseFilter);
  
      ScholarshipInfo = await  Scholarship.find(baseFilter)
        .skip(skip)
        .limit(limit);
  
      //TitleCase
      const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
      const modifiedScholarshipInfo =  await Promise.all(
        ScholarshipInfo.map(async (student) => {
          const courseFees = await CourseFees.findOne({ name: student.course });
          return {
            ...student._doc, // Spread the student document properties
            name: toTitleCase(`${student.name}`),
            totalFees: courseFees ? courseFees.totalFees : 'Course not found', 
          };
        })
      );
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data:modifiedScholarshipInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching Scholarship information', details: error });
    }
  });

  // Update College Info
router.put('/:id', async (req, res) => {
    try {
      const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!scholarship) {
        return res.status(404).json({ message: 'Scholarship Data not found' });
      }
      res.status(200).json(scholarship);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a College Info
  router.delete('/:id', async (req, res) => {
    try {
      const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
      if (!scholarship) {
        return res.status(404).json({ message: 'Scholarship Data not found' });
      }
      res.status(200).json({ message: 'Scholarship Data deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

module.exports = router;*/

//firebase firestore 
const express = require('express');
const router = express.Router();
const { sendScholarshipEmail } = require('../scholarshipData/services/emailService');
const CourseFees = require('../../models/coursesData/fees');
const { db } = require('../../../firebase.js');
const logger = require('../../../logger.js');

// Function to convert a string to title case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// API Endpoint to Save Scholarship Data (firebase firestore)
router.post('/', async (req, res) => {
  logger.info('API call received: POST /api/scholarship');
  try {
    req.body.name = toTitleCase(req.body.name);
    const data = req.body;
  
    const docRef = await db.collection('scholarship').add(data);

    // Send the scholarship email
    // await sendScholarshipEmail( data.email, data.name);
    logger.info(`Scholarship data added successfully to "scholarship" collection with ID: ${docRef.id}`);
    res.status(201).json({ id: docRef.id, message: 'Scholarship data added successfully!' });
  } catch (error) {
    logger.error('Error adding scholarship data to "scholarship" collection:', error.message);
    res.status(500).json({ error: 'Error adding scholarship data', details: error.message });
  }
});

router.get('/', async (req, res) => {
  logger.info('API call received: GET /api/scholarship');
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { scholarshipStatus } = req.query;

    let query = db.collection('scholarship'); 

    if (scholarshipStatus && scholarshipStatus !== '') {
      query = query.where('scholarshipStatus', '==', scholarshipStatus);
      logger.info(`Filtering scholarships by status: ${scholarshipStatus}`);
    }

    const snapshot = await query.offset(skip).limit(limit).get();
    const totalDocsSnapshot = await db.collection('scholarship').get();
    
    let scholarship = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: toTitleCase(`${data.name || ''}`),
      };
    });

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      scholarship = scholarship.filter(user => {
        return (
          user.name?.toLowerCase().includes(lowerSearchQuery) ||
          user.collegeName?.toLowerCase().includes(lowerSearchQuery) ||
          user.mobileNumber?.toLowerCase().includes(lowerSearchQuery) ||
          user.email?.toLowerCase().includes(lowerSearchQuery) ||
          user.address?.toLowerCase().includes(lowerSearchQuery) ||
          user.scholarshipStatus?.toLowerCase().includes(lowerSearchQuery) ||
          user.interviewFeedback?.toLowerCase().includes(lowerSearchQuery) ||
          user.source?.toLowerCase().includes(lowerSearchQuery)
        );
      });
      logger.info(`Search query applied: ${searchQuery}, filtered results: ${scholarship.length}`);
    }

    // const modifiedScholarships = await Promise.all(
    //   scholarship.map(async (scholarship) => {
    //     const courseFeesSnapshot = await db.collection('coursesFees')
    //       .where('name', '==', scholarship.course)
    //       .limit(1)
    //       .get();
    //       // console.log( scholarship);

    //     let totalFees = 'Course not found'; 
    //     if (!courseFeesSnapshot.empty) {
    //       const courseFeesDoc = courseFeesSnapshot.docs[0].data();
    //       totalFees = courseFeesDoc?.totalFees || 'Course not found';
    //     }

    //     return {
    //       ...scholarship,
    //       totalFees: totalFees,
    //     };
    //   })
    // );

    const totalDocuments = totalDocsSnapshot.size;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: scholarship,
    });
  } catch (error) {
    logger.error('Error fetching scholarship data from "scholarship" collection:', error.message);
    res.status(400).send({ error: 'Error fetching Scholarship information', details: error });
  }
});

// Update Scholarship Info (PUT request)
router.put('/:id', async (req, res) => {
  logger.info(`API call received: PUT /api/scholarship/${req.params.id}`);
  console.log(req.body);
  try {
    const scholarshipRef = db.collection('scholarship').doc(req.params.id);
    const scholarshipDoc = await scholarshipRef.get();

    if (!scholarshipDoc.exists) {
      logger.error(`Scholarship data with ID: ${req.params.id} not found in "scholarship" collection`);
      return res.status(404).json({ message: 'Scholarship Data not found' });
    }

    await scholarshipRef.update(req.body);
    logger.info(`Scholarship data with ID: ${req.params.id} updated successfully in "scholarship" collection`);

    const updatedScholarship = await scholarshipRef.get();
    res.status(200).json(updatedScholarship.data()); 
  } catch (err) {
    logger.error(`Error updating scholarship data with ID: ${req.params.id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// Delete Scholarship Info (DELETE request)
router.delete('/:id', async (req, res) => {
  logger.info(`API call received: DELETE /api/scholarship/${req.params.id}`);
  try {
    const scholarshipRef = db.collection('scholarship').doc(req.params.id);
    const scholarshipDoc = await scholarshipRef.get();

    if (!scholarshipDoc.exists) {
      logger.error(`Scholarship data with ID: ${req.params.id} not found in "scholarship" collection`);
      return res.status(404).json({ message: 'Scholarship Data not found' });
    }

    await scholarshipRef.delete();
    logger.info(`Scholarship data with ID: ${req.params.id} deleted successfully from "scholarship" collection`);

    res.status(200).json({ message: 'Scholarship Data deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting scholarship data with ID: ${req.params.id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

