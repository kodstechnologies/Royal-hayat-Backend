import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../modules/doctors/models/doctor.model.js';

dotenv.config();

// Sample doctors data from frontend - you can replace this with actual data
const sampleDoctors = [
  {
    name: 'Dr. Mustafa Alfiki',
    nameAr: 'Dr. Mustafa Alfiki',
    specialty: 'Clinical Pharmacy',
    specialtyAr: 'Clinical Pharmacy',
    department: 'Clinical Pharmacy',
    departmentAr: 'Clinical Pharmacy',
    title: 'Head of Clinical Pharmacy',
    titleAr: 'Head of Clinical Pharmacy',
    bio: 'Dr. Mustafa Alfiki is a specialist in the Clinical Pharmacy department at Royale Hayat Hospital.',
    bioAr: 'Dr. Mustafa Alfiki is a specialist in the Clinical Pharmacy department at Royale Hayat Hospital.',
    qualifications: [
      'Bachelor\'s Degree in Clinical Pharmaceutical Science (BPharm)',
      'Master\'s Degree in Clinical Pharmacology and Toxicology, Cairo University',
      'Doctor of Pharmacy Degree (PharmD)',
      'Published and contributed to several research papers',
      'Member of the Kuwait Pharmaceutical Association',
      'Over 10 years of experience in all aspects of medication management and pharmacy operations'
    ],
    qualificationsAr: [
      'Bachelor\'s Degree in Clinical Pharmaceutical Science (BPharm)',
      'Master\'s Degree in Clinical Pharmacology and Toxicology, Cairo University',
      'Doctor of Pharmacy Degree (PharmD)',
      'Published and contributed to several research papers',
      'Member of the Kuwait Pharmaceutical Association',
      'Over 10 years of experience in all aspects of medication management and pharmacy operations'
    ],
    expertise: [
      'Medication Management',
      'Clinical Pharmacology',
      'Pharmaceutical Care',
      'Drug Information Services'
    ],
    expertiseAr: [
      'Medication Management',
      'Clinical Pharmacology',
      'Pharmaceutical Care',
      'Drug Information Services'
    ],
    languages: ['English', 'Arabic'],
    languagesAr: ['English', 'Arabic'],
    initials: 'MA',
    color: '#3B82F6',
    symptoms: ['Medication Consultation', 'Drug Review', 'Pharmaceutical Advice'],
    availableOnline: true,
    image: '/images/doctors/dr-mustafa-alfiki.png'
  },
  {
    name: 'Dr. Sarah Johnson',
    nameAr: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    specialtyAr: 'Cardiology',
    department: 'Cardiology',
    departmentAr: 'Cardiology',
    title: 'Senior Cardiologist',
    titleAr: 'Senior Cardiologist',
    bio: 'Dr. Sarah Johnson is a leading cardiologist with extensive experience in interventional cardiology.',
    bioAr: 'Dr. Sarah Johnson is a leading cardiologist with extensive experience in interventional cardiology.',
    qualifications: [
      'MD from Harvard Medical School',
      'Fellowship in Interventional Cardiology',
      'Board Certified in Cardiology'
    ],
    qualificationsAr: [
      'MD from Harvard Medical School',
      'Fellowship in Interventional Cardiology',
      'Board Certified in Cardiology'
    ],
    expertise: [
      'Interventional Cardiology',
      'Echocardiography',
      'Cardiac Catheterization',
      'Heart Disease Prevention'
    ],
    expertiseAr: [
      'Interventional Cardiology',
      'Echocardiography',
      'Cardiac Catheterization',
      'Heart Disease Prevention'
    ],
    languages: ['English', 'Arabic'],
    languagesAr: ['English', 'Arabic'],
    initials: 'SJ',
    color: '#EF4444',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Heart Palpitations', 'High Blood Pressure'],
    availableOnline: true,
    image: '/images/doctors/dr-sarah-johnson.png'
  }
];

async function migrateDoctors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-hayat');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert sample doctors
    const insertedDoctors = await Doctor.insertMany(sampleDoctors);
    console.log(`Successfully migrated ${insertedDoctors.length} doctors`);

    // Display inserted doctors
    insertedDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.specialty}`);
    });

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateDoctors();
