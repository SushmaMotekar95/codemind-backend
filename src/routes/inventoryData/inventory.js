const express = require('express');
const router = express.Router();
const inventory = require('../../models/inventoryData/inventory');

// API Endpoint to Save Student Data
router.post('/', async (req, res) => {
  try {
    const Inventory  = new inventory(req.body);
    await Inventory.save();
    res.status(201).send(Inventory);
  } catch (error) {
    res.status(400).send({ error: 'Error saving inventory data', details: error });
  }
});

router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.search?.trim();
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10;  
      const skip = (page - 1) * limit;  
      let inventoryInfo, totalDocuments;
      const { status } = req.query;
      const baseFilter = searchQuery
        ? {
            $or: [
              { firstName: new RegExp(searchQuery, 'i') }, 
              { lastName: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { mobileNumber: new RegExp(searchQuery, 'i') },
              { jobTitle: new RegExp(searchQuery, 'i') },
              { address: new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.inventoryName': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.modelName': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.issueDescription': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.assignedTo': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.status': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.resolutionComment': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.returned': new RegExp(searchQuery, 'i') },
              { 'inventoryDetails.returncomment': new RegExp(searchQuery, 'i') },
            ]
          }
        : {};

        if (status && status !== '') {
            baseFilter.inventoryDetails = {
              $elemMatch: { status: status }
            };
          }
  
        // if ( issueStatus &&  issueStatus !== 'All') {
        //   baseFilter. issueStatus =  issueStatus;
        // }
  
       /* if (startDate) {
          baseFilter.date = { ...baseFilter.issue_created_date, $gte: new Date(startDate) };
        }
  
        if (endDate) {
          baseFilter.date = { ...baseFilter.issue_created_date, $lte: new Date(endDate) };
        }*/
    
      totalDocuments = await  inventory.countDocuments(baseFilter);
  
      inventoryInfo = await inventory.find(baseFilter)
        .skip(skip)
        .limit(limit);

      // Calculate the status-wise counts using aggregation
    const statusCounts = await inventory.aggregate([
      { $unwind: '$inventoryDetails' }, // Unwind inventoryDetails array
      { $group: { _id: '$inventoryDetails.status', count: { $sum: 1 } } }, // Group by status and count
      { $project: { status: '$_id', count: 1, _id: 0 } }, // Format output
    ]);
  
       //TitleCase
       const toTitleCase = (str) => {
        return str.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
      };
      
       const modifiedInventoryInfo =  inventoryInfo.map(user => ({
        ...user.toObject(),  
        name: toTitleCase(`${user.firstName} ${user.lastName}`)  
      }));
  
      const totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).send({
        totalRecords: totalDocuments,  
        totalPages,      
        currentPage: page,  
        data: modifiedInventoryInfo,
        statusCounts,
      });
    } catch (error) {
      res.status(400).send({ error: 'Error fetching Student Issue', details: error });
    }
  });
  
  
  // API Endpoint to Update Follow-Up Data
  router.put('/:id', async (req, res) => {
      try {
        const inventoryId = req.params.id;
        const updatedInventory = await inventory.findByIdAndUpdate(inventoryId, req.body, { new: true, runValidators: true, });
    
        if (!updatedInventory) {
          return res.status(404).send({ error: 'Inventory not found' });
        }
    
        res.status(200).send(updatedInventory);
      } catch (error) {
        res.status(400).send({ error: 'Error updating Inventory data', details: error });
      }
    });
  
    // API Endpoint to Delete perticular Student
  router.delete('/:id', async (req, res) => {
    try {
      const  deleteInventory = await inventory.findByIdAndDelete(req.params.id);
      if (!deleteInventory) {
        return res.status(404).send({ error: 'inventory not found' });
      }
      res.status(200).send({ message: 'inventory deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: 'Error deleting inventory', details: error });
    }
  });
  
  module.exports = router;