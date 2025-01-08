/*const express = require('express');
const router = express.Router();
const { db } = require('../../../firebase.js');
const Bootcamp = require('../../models/bootcampData/codemindBootcamp');
const { sendBootcampEmail } = require('../bootcampData/services/emailServices');

// API Endpoint to Save Bootcamp Data
router.post('/', async (req, res) => {
    try {
        const bootcamp = new Bootcamp(req.body);
        await bootcamp.save();
        res.status(201).send(bootcamp);
    } catch (error) {
        res.status(400).send({ error: 'Error saving bootcamp data', details: error });
    }
});

// API Endpoint to Get All Bootcamp Data
router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      const { selectedBootcamp } = req.query;
      let BootcampInfo, totalDocuments;
      const baseFilter = searchQuery
        ? {
            $or: [
              { firstName: new RegExp(searchQuery, 'i') }, 
              { lastName: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { mobileNumber: new RegExp(searchQuery, 'i') },
              { selectedBootcamp: new RegExp(searchQuery, 'i') },
              { source: new RegExp(searchQuery, 'i') },
            ]
          }
        : {};
      
      if (selectedBootcamp && selectedBootcamp !== '') {
        baseFilter.selectedBootcamp = selectedBootcamp;
      }
  
      totalDocuments = await Bootcamp.countDocuments(baseFilter);

      BootcampInfo = await Bootcamp.find(baseFilter)
        .skip(skip)
        .limit(limit);
      
        //TitleCase
        const toTitleCase = (str) => {
          return str.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
        };
        
        const modifiedBootcampInfo = BootcampInfo.map(user => ({
          ...user.toObject(),
          name: toTitleCase(`${user.firstName} ${user.lastName}`.trim())
        }));
      
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data: modifiedBootcampInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching Bootcamp student information', details: error });
    }
  });

  // New route for sending the email
 router.post('/:id/send-email', async (req, res) => {
  try {
    const bootcampId = req.params.id;
    const student = await Bootcamp.findById( bootcampId );

    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    const { firstName, email, selectedBootcamp } = student;

    await sendBootcampEmail( firstName, email, selectedBootcamp );

    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error sending email', details: error });
  }
});
  
// API Endpoint to Update Bootcamp Data
router.put('/:id', async (req, res) => {
    try {
        const bootcampId = req.params.id;
        const updatedBootcamp = await Bootcamp.findByIdAndUpdate(bootcampId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedBootcamp) {
            return res.status(404).send({ error: 'Bootcamp entry not found' });
        }

        res.status(200).send(updatedBootcamp);
    } catch (error) {
        res.status(400).send({ error: 'Error updating bootcamp data', details: error });
    }
});

// API Endpoint to Delete Bootcamp Data
router.delete('/:id', async (req, res) => {
    try {
        const bootcampId = req.params.id;
        const deletedBootcamp = await Bootcamp.findByIdAndDelete(bootcampId);

        if (!deletedBootcamp) {
            return res.status(404).send({ error: 'Bootcamp entry not found' });
        }

        res.status(200).send({ message: 'Bootcamp entry deleted successfully' });
    } catch (error) {
        res.status(400).send({ error: 'Error deleting bootcamp data', details: error });
    }
});

module.exports = router;*/

const express = require('express');
const router = express.Router();
const { db } = require('../../../firebase.js');
const logger = require('../../../logger.js');
const { sendBootcampEmail } = require('../bootcampData/services/emailServices');

// Helper function for TitleCase
const toTitleCase = (str) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// API Endpoint to Save Bootcamp Data
router.post('/', async (req, res) => {
  logger.info(`API call received: POST /api/bootcamp/codemindBootcamp`);
  try {
    const data = req.body;
    const docRef = await db.collection('codemindBootcamp').add(data);

    logger.info(`Successfully added Bootcamp data with ID: ${docRef.id} to "codemindBootcamp" collection`);
    res.status(201).json({ id: docRef.id, message: 'Bootcamp data added successfully!' });
  } catch (error) {

    logger.error(`Error adding Bootcamp data: ${error.message}`);
    res.status(500).json({ error: 'Error adding Bootcamp data', details: error.message });
  }
});

// API Endpoint to Get All Bootcamp Data
router.get('/', async (req, res) => {
  logger.info(`API call received: GET /api/bootcamp/codemindBootcamp`);
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { selectedBootcamp } = req.query;

    let query = db.collection('codemindBootcamp');
    if (searchQuery) {
      query = query.where('firstName', '>=', searchQuery).where('firstName', '<=', searchQuery + '\uf8ff');
    }
    if (selectedBootcamp) {
      query = query.where('selectedBootcamp', '==', selectedBootcamp);
    }

    const snapshot = await query.offset(skip).limit(limit).get();
    const totalSnapshot = await db.collection('codemindBootcamp').get();

    const bootcampData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: toTitleCase(`${data.firstName} ${data.lastName}`.trim()),
      };
    });

    // if (searchQuery) {
    //   const lowerSearchQuery = searchQuery.toLowerCase();
    //   bootcampData = bootcampData.filter(user => {
    //     return (
    //       user.firstName?.toLowerCase().includes(lowerSearchQuery) ||
    //       user.lastName?.toLowerCase().includes(lowerSearchQuery) ||
    //       user.mobileNumber?.toLowerCase().includes(lowerSearchQuery) ||
    //       user.email?.toLowerCase().includes(lowerSearchQuery) ||
    //       user.selectedBootcamp?.toLowerCase().includes(lowerSearchQuery) ||
    //       user.source?.toLowerCase().includes(lowerSearchQuery)
    //     );
    //   });
    // }
    
    res.status(200).send({
      totalRecords: totalSnapshot.size,
      totalPages: Math.ceil(totalSnapshot.size / limit),
      currentPage: page,
      data: bootcampData,
    });
  } catch (error) {
    logger.error(`Error fetching Bootcamp data: ${error.message}`);
    res.status(400).send({ error: 'Error fetching bootcamp data', details: error.message });
  }
});


// New route for sending the email
router.post('/:id/send-email', async (req, res) => {
  logger.info(`API call received: POST /api/bootcamp/codemindBootcamp/${ req.params.id}/end-email`);
  try {
    const bootcampId = req.params.id;
    const doc = await db.collection('bootcamp').doc(bootcampId).get();

    if (!doc.exists) {
      logger.error(`Bootcamp entry with ID: ${bootcampId} not found`);
      return res.status(404).send({ error: 'Student not found' });
    }

    const { firstName, email, selectedBootcamp } = doc.data();
    await sendBootcampEmail(firstName, email, selectedBootcamp);

    logger.info(`Successfully sent email for Bootcamp entry with ID: ${bootcampId}`);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    logger.error(`Error sending email for Bootcamp entry with ID: ${bootcampId}: ${error.message}`);
    res.status(400).send({ error: 'Error sending email', details: error.message });
  }
});

// API Endpoint to Update Bootcamp Data
router.put('/:id', async (req, res) => {
  logger.info(`API call received: PUT /api/bootcamp/codemindBootcamp/${ req.params.id}`);

  try {
    const bootcampId = req.params.id;
    const docRef = db.collection('codemindBootcamp').doc(bootcampId);

    const doc = await docRef.get();
    if (!doc.exists) {
      logger.error(`Bootcamp entry with ID: ${bootcampId} not found`);
      return res.status(404).send({ error: 'Bootcamp entry not found' });
    }

    await docRef.update(req.body);
    logger.info(`Successfully updated Bootcamp data with ID: ${bootcampId} in "codemindBootcamp" collection`);
    res.status(200).send({ id: bootcampId, ...req.body });
  } catch (error) {
    logger.error(`Error updating Bootcamp data with ID: ${bootcampId}: ${error.message}`);
    res.status(400).send({ error: 'Error updating bootcamp data', details: error.message });
  }
});

// API Endpoint to Delete Bootcamp Data
router.delete('/:id', async (req, res) => {
  logger.info(`API call received: DELETE /api/bootcamp/codemindBootcamp/${ req.params.id}`);

  try {
    const bootcampId = req.params.id;
    const docRef = db.collection('codemindBootcamp').doc(bootcampId);

    const doc = await docRef.get();
    if (!doc.exists) {
      logger.error(`Bootcamp entry with ID: ${bootcampId} not found`);
      return res.status(404).send({ error: 'Bootcamp entry not found' });
    }

    await docRef.delete();
    logger.info(`Successfully deleted Bootcamp entry with ID: ${bootcampId} from "codemindBootcamp" collection`);
    res.status(200).send({ message: 'Bootcamp entry deleted successfully' });
  } catch (error) {

    logger.error(`Error deleting Bootcamp entry with ID: ${bootcampId}: ${error.message}`);
    res.status(400).send({ error: 'Error deleting bootcamp data', details: error.message });
  }
});

module.exports = router;