const express = require('express');
const CollegeInfo = require('../../models/collegeData/collegeInfo');
const router = express.Router();

// Create a new College Info
router.post('/', async (req, res) => {
  try {
    const college = new CollegeInfo(req.body);
    await college.save();
    res.status(201).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Colleges
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await CollegeInfo.find();
    res.status(200).json(colleges);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let  colleges , totalDocuments;
      const { visitedStatus ,universityName, district, startDate, endDate } = req.query;
      const baseFilter = searchQuery
        ? {
            $or: [
              { collegeName: new RegExp(searchQuery, 'i') }, 
              { universityName: new RegExp(searchQuery, 'i') },
              { address: new RegExp(searchQuery, 'i') },
              { city: new RegExp(searchQuery, 'i') },
              { state: new RegExp(searchQuery, 'i') },
              { district: new RegExp(searchQuery, 'i') },
              { principalName: new RegExp(searchQuery, 'i') },
              { collegeContact: new RegExp(searchQuery, 'i') },
              { visitedStatus: new RegExp(searchQuery, 'i') },
            ]
        }
        : {};
  
        if (visitedStatus && visitedStatus !== '') {
          baseFilter.visitedStatus = visitedStatus;
        }
  
        if (universityName && universityName !== 'All') {
          baseFilter.universityName = universityName;
        }

        if (district && district !== 'All') {
          baseFilter.district = district;
        }

        // Date filter
        if (startDate || endDate) {
          baseFilter.visitedPlanDate = {}; 
          if (startDate) {
            baseFilter.visitedPlanDate.$gte = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)); // Start of day in UTC
          }
          if (endDate) {
            baseFilter.visitedPlanDate.$lte = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)); // End of day in UTC
          }
        }

        
      totalDocuments = await CollegeInfo.countDocuments(baseFilter);
  
      colleges = await CollegeInfo.find(baseFilter)
        .skip(skip)
        .limit(limit);
  
      //TitleCase
      const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
      const modifiedCollegeInfo =  colleges.map(user => ({
        ...user.toObject(),  
        name: toTitleCase(`${user.collegeName}`)  
      }));
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data:modifiedCollegeInfo
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching College information', details: error });
    }
  });
// Get a single College by ID
router.get('/:id', async (req, res) => {
  try {
    const college = await CollegeInfo.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update College Info
router.put('/:id', async (req, res) => {
  try {
    const college = await CollegeInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a College Info
router.delete('/:id', async (req, res) => {
  try {
    const college = await CollegeInfo.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
