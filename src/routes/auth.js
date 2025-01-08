//Mongodb code
/*const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/user');
const { sendUserCreationEmail } = require('../routes/usersEmail');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { firstname, lastname, email, mobile_number, password, role } = req.body;
  try {
    const user = new User({ firstname, lastname, email, mobile_number, password, role });
    await user.save();
    // await sendUserCreationEmail(user, user.plainPassword);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user:', error); 
    res.status(500).json({ message: 'Server error' });
  }
});

// GET API to retrieve all users
router.get('/users', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;  
    const skip = (page - 1) * limit;  
    const { role } = req.query;
    let userInfo, totalDocuments;
    const baseFilter = searchQuery
      ? {
          $or: [
            { firstname: new RegExp(searchQuery, 'i') }, 
            { lastname: new RegExp(searchQuery, 'i') },
            { email: new RegExp(searchQuery, 'i') },
            { mobile_number: new RegExp(searchQuery, 'i') },
            { role: new RegExp(searchQuery, 'i') },
          ]
        }
      : {};
    
    if (role && role !== '') {
      baseFilter.role = role;
    }

    totalDocuments = await User.countDocuments(baseFilter);

    userInfo = await User.find(baseFilter)
      .skip(skip)
      .limit(limit);

    const modifiedUserInfo = userInfo.map(user => ({
      ...user.toObject(),  
      name: `${user.firstname} ${user.lastname}`  
    }));

    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      totalRecords: totalDocuments,  
      totalPages,      
      currentPage: page,  
      data: modifiedUserInfo
    });
  } catch (error) {
    res.status(400).send({ error: 'Error fetching Bootcamp student information', details: error });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.PRIVATE_KEY, { expiresIn: '1h' });
    const fullName = `${user.firstname} ${user.lastname}`;
    res.json({ token, role: user.role , firstname: user.firstname, fullName, id: user._id});

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); 
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT request to update users data
router.put('/usersmanagement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).send(updatedUser);
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Failed to update user information' });
  }
});



/*const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

 router.put('/:id',upload.fields([{ name: 'photo' }, { name: 'resume' }]), async (req, res) => {
  const { firstname, lastName, email, mobile_number, role, course, city, gitUrl, mockFeedback, attendance } = req.body;
  const updateData = {
    firstname,
    lastName,
    email,
    mobile_number,
    role,
    course,
    city,
    gitUrl,
    mockFeedback,
    attendance 
  };

  if (req.files['photo']) {
    updateData.photo = req.files['photo'][0].path;
  }

  if (req.files['resume']) {
    updateData.resume = req.files['resume'][0].path;
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// API Endpoint to Delete perticular Student
router.delete('/deleteusers/:id', async (req, res) => {
  try {
    const  deleteUser = await User.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting user', details: error });
  }
});*/


//firebase firestore code
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { db } = require('../../firebase.js');
const logger = require('../../logger.js');

// Initialize Firestore
const db1 = admin.firestore();

// POST API to create a new user
router.post('/signup', async (req, res) => {
  logger.info('API call received: POST /api/auth/signup');
  const { firstname, lastname, email, mobile_number, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      firstname,
      lastname,
      email,
      mobile_number,
      password: hashedPassword,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    logger.info(`User ${firstname} ${lastname} registered successfully with email: ${email}`); 

    const userRef = db.collection('users').doc();
    await userRef.set(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Error saving user: ' + error.message); 
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  logger.info('API call received: GET /api/auth/users');
  try {
    const searchQuery = req.query.search?.trim(); 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role } = req.query;

    let query = db.collection('users');
    
    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, name: `${data.firstname} ${data.lastname}` };
    });

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      users = users.filter(user => {
        return (
          user.firstname.toLowerCase().includes(lowerSearchQuery) ||
          user.lastname.toLowerCase().includes(lowerSearchQuery) ||
          user.email.toLowerCase().includes(lowerSearchQuery) ||
          user.mobile_number.toLowerCase().includes(lowerSearchQuery) ||
          (user.role && user.role.toLowerCase().includes(lowerSearchQuery))
        );
      });
    }

    const totalDocs = users.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const paginatedUsers = users.slice(skip, skip + limit);
    // logger.info(`Fetched ${paginatedUsers.length} users, total: ${totalDocs}`);
    res.status(200).send({
      totalRecords: totalDocs,
      totalPages,
      currentPage: page,
      data: paginatedUsers,
    });
  } catch (error) {
    logger.error('Error fetching users: ' + error.message);
    res.status(500).json({ message: 'Server error', details: error });
  }
});

// POST API for login
router.post('/login', async (req, res) => {
  logger.info('API call received: POST /api/auth/login');
  const { email, password } = req.body;
  try {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      logger.error(`Invalid credentials for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error(`Invalid credentials for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: userDoc.id, role: user.role }, process.env.PRIVATE_KEY, { expiresIn: '1h' });
    const fullName = `${user.firstname} ${user.lastname}`;
    logger.info(`User ${fullName} logged in successfully`);
    res.json({ token, role: user.role, firstname: user.firstname, fullName, id: userDoc.id });
  } catch (error) {
    logger.error('Error during login: ' + error.message);
    // console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET API to retrieve a user by ID
router.get('/:id', async (req, res) => {
  logger.info('API call received: GET /api/auth/:id');
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();

    if (!userDoc.exists) {
      logger.error(`User with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userDoc.data();
    delete user.password;
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user: ' + error.message);
    // console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT API to update a user
router.put('/usersmanagement/:id', async (req, res) => {
  logger.info('API call received: PUT /api/auth/usersmanagement/:id');
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error(`User with ID ${id} not found`); 
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.update({
      ...updatedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedUser = (await userRef.get()).data();
    logger.info(`User with ID ${id} updated successfully`);
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error('Error updating user: ' + error.message);
    // console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Delete a Specific User
router.delete('/deleteusers/:id', async (req, res) => {
  logger.info('API call received: DELETE /api/auth/deleteusers/:id');
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error(`User with ID ${req.params.id} not found for deletion`);
      return res.status(404).send({ error: 'User not found' });
    }

    await userRef.delete();
    logger.info(`User with ID ${req.params.id} deleted successfully`);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    // console.error('Error deleting user:', error);
    logger.error('Error deleting user: ' + error.message);
    res.status(500).send({ error: 'Error deleting user', details: error });
  }
});

module.exports = router;


