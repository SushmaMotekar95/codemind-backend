const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true }, 
    mobileNumber: { type: String, required: true }, 
    email: { type: String, required: true }, 
    jobTitle: { type: String, required: true },
    address: { type: String},
    inventoryDetails: [{
    inventoryName: { type: String, required: true }, 
    modelName: { type: String, required: true },
    inventoryAssignedDate: { type: Date, required: true, default: Date.now },
    issueDescription: { type: String,  },
    issueDate: { type: Date, default: null }, 
    assignedTo: { type: String },
    status: { type: String, default: 'New Issue' },
    resolvedDate: { type: Date, default: null},
    resolutionComment: { type: String },
    returned: { type: String, default: 'Not Return' }, 
    returnDate: { type: Date , default: null},
    returncomment: { type: String }  
     }],
  
});

const inventory = mongoose.model('Inventory', inventorySchema);

module.exports = inventory;
