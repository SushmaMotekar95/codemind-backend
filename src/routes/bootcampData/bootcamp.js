const express = require('express');
const router = express.Router();
const Bootcamp = require('../../models/bootcampData/bootcamp');

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
      const { paymentStatus , source} = req.query;
      let BootcampInfo, totalDocuments;
      const baseFilter = searchQuery
        ? {
            $or: [
              { firstName: new RegExp(searchQuery, 'i') }, 
              { middleName: new RegExp(searchQuery, 'i') }, 
              { lastName: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { mobileNumber: new RegExp(searchQuery, 'i') },
              { paymentId: new RegExp(searchQuery, 'i') },
              { paymentStatus: new RegExp(searchQuery, 'i') },
              { course: new RegExp(searchQuery, 'i') },
              { batch: new RegExp(searchQuery, 'i') },
              { source: new RegExp(searchQuery, 'i') },
            ]
          }
        : {};
      
      if (paymentStatus && paymentStatus !== 'All') {
        baseFilter.paymentStatus = paymentStatus;
      }

      if (source && source !== '') {
        baseFilter.source = source;
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
          name: toTitleCase(`${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim())
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

module.exports = router;
