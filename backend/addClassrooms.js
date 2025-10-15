const { sequelize } = require('./src/config/db.js');
const { Classroom, Department } = require('./src/models/index.js');

async function addDefaultClassrooms() {
  try {
    // Get the first department
    const dept = await Department.findOne();
    if (!dept) {
      console.log('No departments found. Please add departments first.');
      return;
    }
    
    // Check if classrooms already exist
    const existingRooms = await Classroom.count();
    if (existingRooms > 0) {
      console.log('Classrooms already exist:', existingRooms);
      return;
    }
    
    // Add default classrooms
    const defaultRooms = [
      { name: 'Classroom 1', code: 'C1', type: 'Classroom', capacity: 50, department_id: dept.department_id },
      { name: 'Classroom 2', code: 'C2', type: 'Classroom', capacity: 50, department_id: dept.department_id },
      { name: 'Lab 1', code: 'L1', type: 'Lab', capacity: 30, department_id: dept.department_id },
      { name: 'Lab 2', code: 'L2', type: 'Lab', capacity: 30, department_id: dept.department_id },
      { name: 'Conference Room', code: 'CR1', type: 'Classroom', capacity: 20, department_id: dept.department_id }
    ];
    
    await Classroom.bulkCreate(defaultRooms);
    console.log('Added', defaultRooms.length, 'default classrooms');
    
  } catch (error) {
    console.error('Error adding classrooms:', error.message);
  } finally {
    await sequelize.close();
  }
}

addDefaultClassrooms();
